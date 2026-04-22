# Operately Skills

Agent skills for operating [Operately](https://github.com/operately/operately) CLI — the open source system for running goals and projects.

These skills help compatible agent tools understand how to use the Operately CLI. They do not install the CLI for you and they do not replace Operately signup/authentication.

## Install

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
| **operately-cli** | Operate Operately via CLI — auth, projects, goals, tasks, spaces, resource hubs |
