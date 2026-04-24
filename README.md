# Operately Skills

Agent skills for operating the [Operately](https://github.com/operately/operately) CLI, the open source system for running goals and projects.

These skills help compatible agent tools understand how to use the Operately CLI. They do not install the CLI for you and they do not replace Operately signup/authentication.

## Install

After this skill is published to ClawHub, install it with:

```bash
clawhub install operately-cli
```

Until then, install it from Git:

```bash
npx skills add https://github.com/operately/skills
```

Or install a specific skill:

```bash
npx skills add https://github.com/operately/skills --skill operately-cli
```

## Skills

| Skill | Description |
| --- | --- |
| **operately-cli** | Manage Operately goals, projects, tasks, check-ins, and team operations from the CLI |

## Maintainer Workflow

Use this section only when changing and publishing skills from this repository.

### Packaging Rules

- Skill source lives under `skills/<skill-name>/`.
- `dist/` is generated output and must not be committed.
- Every published skill must have a `version` field in `SKILL.md` frontmatter.
- Bump the `SKILL.md` version before publishing any changed package.
- Use `scripts/package-clawhub`; do not create release zips by hand.
- Keep `.clawhubignore` in each skill folder for files that must never enter the package.

### Create a Package

From the repository root:

```bash
scripts/package-clawhub operately-cli
```

The package name is derived from `name` and `version` in `SKILL.md`:

```text
dist/<name>-<version>-clawhub.zip
```

The packager is deterministic: it sorts files, normalizes timestamps and permissions, applies `.clawhubignore`, validates that packaged files are UTF-8 text, and prints a SHA-256 checksum. Running the same command twice against the same source should print the same checksum.

### Verify the Package

Inspect the archive before publishing:

```bash
unzip -l dist/operately-cli-1.0.0-clawhub.zip
```

Expected contents:

- `SKILL.md`
- `.clawhubignore`
- supporting text files such as `references/*.md`

Do not publish if the archive contains local install state, editor files, build output, secrets, or anything outside the skill folder.

### Publish

Install and log in to the ClawHub CLI:

```bash
npm i -g clawhub
clawhub login
```

Publish with the repo script:

```bash
scripts/publish-clawhub operately-cli --changelog "Initial ClawHub package"
```

The publish script packages the skill first, reads `name` and `version` from `SKILL.md`, detects whether the installed ClawHub CLI supports `clawhub publish` or `clawhub skill publish`, then runs the supported command.

To check the exact commands without publishing:

```bash
scripts/publish-clawhub operately-cli --changelog "Initial ClawHub package" --dry-run
```

For future updates, use the same process with a new version and changelog:

```bash
scripts/publish-clawhub operately-cli --changelog "<what changed>"
```

If maintaining many skills, `sync` can publish changed folders, but use it only after reviewing the package contents and changelog:

```bash
clawhub sync --all --bump patch --changelog "Update Operately CLI skill"
```
