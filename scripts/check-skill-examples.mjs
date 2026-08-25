#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_CATALOG = path.resolve(REPO_ROOT, "../operately/cli/src/generated/api-catalog.json");
const SKILL_DIR = path.join(REPO_ROOT, "skills/operately-cli");

const GLOBAL_FLAGS = new Set(["token", "base-url", "profile", "compact", "json", "output", "verbose", "help"]);
const SKIP_SECOND_TOKENS = new Set(["auth", "help", "--version"]);
const CUSTOM_ENDPOINTS = [
  {
    namespace: "documents",
    name: "create_file",
    inputs: [
      { name: "space_id", optional: true, type: { kind: "named", name: "id" } },
      { name: "project_id", optional: true, type: { kind: "named", name: "id" } },
      { name: "goal_id", optional: true, type: { kind: "named", name: "id" } },
      { name: "file", optional: false, type: { kind: "named", name: "path" } },
      { name: "folder_id", optional: true, type: { kind: "named", name: "id" } },
      { name: "name", optional: true, type: { kind: "named", name: "string" } },
      { name: "description", optional: true, type: { kind: "named", name: "json" } },
      { name: "send_notifications_to_everyone", optional: true, type: { kind: "named", name: "boolean" } },
      { name: "subscriber_ids", optional: true, type: { kind: "list", item: { kind: "named", name: "id" } } },
    ],
  },
  {
    namespace: "project_templates",
    name: "create_file",
    inputs: [
      { name: "template_id", optional: false, type: { kind: "named", name: "id" } },
      { name: "parent_folder_id", optional: true, type: { kind: "named", name: "id" } },
      { name: "file", optional: false, type: { kind: "named", name: "path" } },
      { name: "name", optional: true, type: { kind: "named", name: "string" } },
      { name: "description", optional: true, type: { kind: "named", name: "json" } },
    ],
  },
  {
    namespace: "people",
    name: "update_picture",
    inputs: [
      { name: "avatar_file", optional: true, type: { kind: "named", name: "path" } },
      { name: "clear", optional: true, type: { kind: "named", name: "boolean" } },
    ],
  },
];

function kebabToSnake(value) {
  return value.replace(/-/g, "_");
}

function inputTypeName(input) {
  const type = input.type;
  if (!type) return null;
  if (type.kind === "named") return type.name;
  if (type.kind === "list" && type.item?.kind === "named") return type.item.name;
  return null;
}

function isJsonInput(input) {
  return inputTypeName(input) === "json";
}

function loadCatalog(catalogPath) {
  const raw = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const endpoints = new Map();

  for (const endpoint of raw.endpoints) {
    endpoints.set(`${endpoint.namespace}/${endpoint.name}`, endpoint);
  }

  for (const custom of CUSTOM_ENDPOINTS) {
    endpoints.set(`${custom.namespace}/${custom.name}`, custom);
  }

  return endpoints;
}

function collectMarkdownFiles(dir) {
  const files = [path.join(dir, "SKILL.md")];
  const referencesDir = path.join(dir, "references");
  for (const entry of fs.readdirSync(referencesDir)) {
    if (entry.endsWith(".md")) {
      files.push(path.join(referencesDir, entry));
    }
  }
  return files.sort();
}

function extractCodeBlocks(content) {
  const blocks = [];
  const lines = content.split("\n");
  let inBlock = false;
  let blockStart = 0;
  let blockLines = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inBlock) {
        inBlock = true;
        blockStart = i + 1;
        blockLines = [];
      } else {
        blocks.push({ startLine: blockStart, lines: blockLines });
        inBlock = false;
        blockLines = [];
      }
      continue;
    }
    if (inBlock) {
      blockLines.push(line);
    }
  }

  return blocks;
}

function joinContinuations(lines) {
  const joined = [];
  let buffer = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      if (buffer) {
        joined.push(buffer.trim());
        buffer = "";
      }
      continue;
    }

    if (buffer.endsWith("\\")) {
      buffer = `${buffer.slice(0, -1).trim()} ${trimmed}`;
    } else if (buffer) {
      joined.push(buffer.trim());
      buffer = trimmed;
    } else {
      buffer = trimmed;
    }
  }

  if (buffer) joined.push(buffer.trim());
  return joined;
}

function normalizeFlagToken(token) {
  if (!token.startsWith("--")) return token;
  const eq = token.indexOf("=");
  return eq === -1 ? token : token.slice(0, eq);
}

function tokenizeCommand(command) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
        tokens.push(current);
        current = "";
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  return tokens;
}

function rootFlagName(flag) {
  const body = flag.startsWith("--") ? flag.slice(2) : flag;
  const segment = body.split(".")[0];
  return kebabToSnake(segment.replace(/\.\d+$/, ""));
}

function parseOperatelyCommand(line) {
  const tokens = tokenizeCommand(line);
  if (tokens[0] !== "operately") return null;
  if (tokens.length < 2) return null;

  const second = tokens[1];
  if (SKIP_SECOND_TOKENS.has(second)) return null;
  if (second.startsWith("<") || second.includes("<")) return null;
  if (second.startsWith("-")) return null;

  if (tokens.length === 2 || (tokens.length === 3 && tokens[2] === "--help")) {
    return null;
  }

  const namespace = second;
  const command = tokens[2];
  if (!command || command.startsWith("-") || command.startsWith("<") || command.includes("<")) return null;

  const flags = [];
  for (let i = 3; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.startsWith("--")) {
      flags.push(normalizeFlagToken(token));
    }
  }

  if (flags.includes("--help")) return null;

  return { namespace, command, flags };
}

function isAllowedVirtualFileFlag(flag, endpoint) {
  if (flag === "--file" || flag === "--avatar-file") return true;
  if (!flag.endsWith("-file")) return false;

  const base = kebabToSnake(flag.slice(2, -5));
  const input = endpoint.inputs.find((item) => item.name === base);
  return Boolean(input && isJsonInput(input));
}

function validateCommand(endpoints, filePath, lineNumber, parsed) {
  const errors = [];
  const key = `${parsed.namespace}/${parsed.command}`;
  const endpoint = endpoints.get(key);

  if (!endpoint) {
    errors.push(`${filePath}:${lineNumber}: unknown command '${parsed.namespace} ${parsed.command}'`);
    return errors;
  }

  const providedRoots = new Set();
  for (const flag of parsed.flags) {
    const raw = flag.slice(2);
    if (GLOBAL_FLAGS.has(raw)) continue;

    if (isAllowedVirtualFileFlag(flag, endpoint)) {
      providedRoots.add(raw.endsWith("-file") ? kebabToSnake(raw.slice(0, -5)) : kebabToSnake(raw));
      continue;
    }

    const root = rootFlagName(flag);
    const input = endpoint.inputs.find((item) => item.name === root);
    if (!input) {
      errors.push(`${filePath}:${lineNumber}: unknown flag '${flag}' on '${parsed.namespace} ${parsed.command}'`);
      continue;
    }

    providedRoots.add(root);
  }

  for (const input of endpoint.inputs) {
    if (input.optional) continue;
    if (providedRoots.has(input.name)) continue;
    errors.push(
      `${filePath}:${lineNumber}: missing required flag '--${input.name.replace(/_/g, "-")}' on '${parsed.namespace} ${parsed.command}'`,
    );
  }

  return errors;
}

function main() {
  const catalogPath = process.env.OPERATELY_CATALOG_PATH ?? DEFAULT_CATALOG;
  if (!fs.existsSync(catalogPath)) {
    console.error(`Catalog not found: ${catalogPath}`);
    process.exit(1);
  }

  const endpoints = loadCatalog(catalogPath);
  const files = collectMarkdownFiles(SKILL_DIR);
  const errors = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    const relPath = path.relative(REPO_ROOT, filePath);

    for (const block of extractCodeBlocks(content)) {
      const commands = joinContinuations(block.lines);
      for (const command of commands) {
        if (!command.startsWith("operately ")) continue;
        const parsed = parseOperatelyCommand(command);
        if (!parsed) continue;
        errors.push(...validateCommand(endpoints, relPath, block.startLine, parsed));
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} skill example issue(s):\n`);
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    process.exit(1);
  }

  console.log(`Validated CLI examples in ${files.length} file(s) against ${catalogPath}`);
}

main();
