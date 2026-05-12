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

## Maintainers

See [MAINTAINING.md](MAINTAINING.md) for packaging and publishing workflow notes.
