---
name: operately-cli
description: Use when working with the Operately CLI to manage projects, goals, tasks, spaces, and resource hubs. Covers authentication, CRUD operations for all business objects, team collaboration, check-ins, milestones, and organizational workflows. Triggers on "operately", "CLI", "project management", "goal tracking", "OKR", "task", "milestone", "check-in", "space", "resource hub".
---

# Operately CLI

Operate an Operately instance through the `operately` CLI.

## Quick Reference

| Task | Command |
| --- | --- |
| Install CLI | `npm install -g @operately/operately-cli` |
| Login | `operately auth login --token <token>` |
| Who am I | `operately auth whoami` |
| List my assignments | `operately people list_assignments` |
| List projects | `operately projects list` |
| Get project | `operately projects get --id <id> --include-space` |
| Create project | `operately projects create --space-id <id> --name "Q2 Roadmap" --anonymous-access-level 0 --company-access-level 10 --space-access-level 70` |
| List goals | `operately goals list` |
| Create goal | `operately goals create --space-id <id> --name "Revenue Goal" --anonymous-access-level 0 --company-access-level 10 --space-access-level 70` |
| List tasks | `operately tasks list --project-id <id>` |
| Create task | `operately tasks create --type project --id <project-id> --name "Design mockups" --milestone-id <id> --assignee-id null --due-date <date>` |
| List spaces | `operately spaces list` |
| Create document | `operately documents create --resource-hub-id <id> --name "Guide" --content "# Guide"` |
| List hub contents | `operately resource_hubs list_nodes --resource-hub-id <id>` |

## Verify CLI Is Installed

Before any CLI operation, confirm the CLI is available:

```bash
 operately --version
```

If this does not print the version number, the CLI is **not installed**. Stop and tell the user:

> The Operately CLI is not installed. Install it with `npm install -g @operately/operately-cli` and then re-run this task.

Do **not** attempt to install the CLI on behalf of the user. Do **not** continue without a working CLI.

Only after confirming the binary exists should you verify the session:

```bash
operately auth whoami
```

Interpret failures carefully:
- `command not found` from `whoami` still means the CLI is missing.
- Authentication or connection errors mean the CLI exists but the current session cannot reach Operately yet. Tell the user the CLI is installed but the session/auth is not working, and ask them to login.

## Core Workflow

### 1. Authenticate

Generate an API token in the Operately UI at **Profile → API Tokens**, then:

```bash
operately auth login --token <your-token>
operately auth whoami
```

**Important:** If you don't specify `--base-url` when logging in, the CLI defaults to `https://app.operately.com`. For self-hosted or staging environments, always provide the `--base-url` flag:

```bash
# Self-hosted instance
operately auth login --token <token> --base-url https://operately.yourcompany.com

# Check current base URL
operately auth whoami
```

### Authentication Options

Three ways to provide authentication:

1. **Saved profile** (recommended for local use):
   ```bash
   operately auth login --token <token>
   ```

2. **Environment variables** (best for CI/scripts):
   ```bash
   export OPERATELY_API_TOKEN=op_live_xxx
   export OPERATELY_BASE_URL=https://app.operately.com
   ```

3. **Per-command flags** (temporary overrides):
   ```bash
   operately people get_me --token <token> --base-url <url>
   ```

Priority: command flags > environment variables > saved profile.

### Multiple Environments

Use profiles for different environments:

```bash
# Production (default)
operately auth login --token op_live_xxx

# Staging
operately auth login --token op_staging_xxx --profile staging --base-url https://staging.operately.com

# Local development
operately auth login --token op_local_xxx --profile local --base-url http://localhost:4000
```

Switch profiles:
```bash
operately people get_me --profile staging
```

### 2. Command Structure

Commands follow the API endpoint naming:

```bash
operately <namespace> <endpoint_name> [flags]
```

Examples:
```bash
operately people get_me
operately projects list
operately goals create --name "Q2 Revenue Goal" --space-id s1
operately tasks update_status --task-id t1 --type project --status.id done --status.label "Done" --status.color green --status.index 2 --status.value done --status.closed true
```

### 3. Input Flags

Flags map to API fields using kebab-case:

**Simple values:**
```bash
operately projects update_name --project-id p1 --name "New Name"
```

**Booleans:**
```bash
operately projects get --id p1 --include-space
operately projects get --id p1 --include-space=true
```

**Nulls:**
```bash
operately goals update_due_date --goal-id g1 --due-date null
```

**Arrays** (repeat the flag):
```bash
operately notifications mark_many_as_read --ids n1 --ids n2
```

**Nested objects** (dot-index notation):
```bash
operately projects update_task_statuses \
  --task-statuses.0.id ts1 \
  --task-statuses.0.label "To Do" \
  --task-statuses.1.id ts2 \
  --task-statuses.1.label "Done"
```

**Markdown content:**

Many commands accept markdown content (documents, descriptions, check-ins). Use `\n` for line breaks and escape special characters:

```bash
# Simple markdown
operately documents create \
  --resource-hub-id rh1 \
  --name "Team Guide" \
  --content "# Getting Started\n\nWelcome to the team."

# Rich markdown with multiple elements
operately documents create \
  --resource-hub-id rh1 \
  --name "API Documentation" \
  --content "# API Guide\n\n## Authentication\n\nUse Bearer tokens:\n\n\`\`\`bash\ncurl -H 'Authorization: Bearer TOKEN' https://api.example.com\n\`\`\`\n\n## Endpoints\n\n- **GET /users** - List users\n- **POST /users** - Create user\n\n### Response Format\n\n\`\`\`json\n{\n  \"users\": [...]\n}\n\`\`\`"

# Project description with formatting
operately projects update_description \
  --project-id p1 \
  --description "# Q2 Roadmap\n\n## Goals\n\n1. Launch new feature\n2. Improve performance\n\n## Timeline\n\n- **May:** Design phase\n- **June:** Development\n- **July:** Launch"
```

Supported markdown:
- Headings: `# H1`, `## H2`, `### H3`
- Bold: `**text**`, Italic: `*text*`
- Lists: `- item` or `1. item`
- Links: `[text](url)`
- Code: `` `inline` `` or `` ```block``` ``
- Line breaks: `\n`

**Access Levels:**

Many create commands require access level parameters to control who can view and interact with resources:

- `--anonymous-access-level` - Access for non-authenticated users (not supported yet, always use `0`)
- `--company-access-level` - Access for company members
- `--space-access-level` - Access for space members

**Access level values:**
- `0` - No access
- `10` - View only
- `40` - Comment
- `70` - Edit
- `100` - Full access

**Common pattern for team resources:**
```bash
--anonymous-access-level 0 \
--company-access-level 10 \
--space-access-level 70
```

**Note:** Get commands use generic `--id` parameter, while create/update commands use entity-specific IDs like `--project-id`, `--goal-id`, etc.

### 4. Output Options

```bash
# Pretty JSON (default)
operately people get_me

# Compact JSON
operately people get_me --compact

# Save to file
operately projects get --id p1 --output ./project.json

# Verbose mode (shows request details)
operately people get_me --verbose
```

## Available Namespaces

The CLI provides access to 198 API endpoints across these namespaces:

- **comments** - Comment management on resources
- **companies** - Company settings, members, permissions
- **documents** - Document creation and management in resource hubs
- **goals** - Goal management, check-ins, targets
- **links** - Link management in resource hubs
- **notifications** - Notification preferences and subscriptions
- **people** - User and team member management
- **projects** - Project management, milestones, check-ins
- **reactions** - Emoji reactions to content
- **resource_hubs** - Resource hub and folder operations
- **spaces** - Space (team/department) management
- **tasks** - Task management across projects

## Assignments and Reviews

Get all items requiring your attention or review with a single command:

```bash
operately people list_assignments
```

This returns assignments categorized into three groups:

- **`due_soon`** - Items you own that are overdue, due today, or due soon
- **`needs_review`** - Items where you are the reviewer (check-ins, goal updates) awaiting acknowledgment
- **`upcoming`** - Items you own with future due dates

Each category contains groups of assignments organized by their origin (project, goal, or space). Assignments include:

- **Milestones** - Project milestones you own
- **Tasks** - Project and space tasks assigned to you
- **Projects** - Projects you own or are reviewing
- **Goals** - Goals you own or are reviewing
- **Check-ins** - Project and goal check-ins requiring your review

The response structure groups related items together and sorts by urgency, making it easy to prioritize your work. Items needing review show the author's name and what action is required.

**See:** `references/assignments-and-reviews.md` for detailed examples, filtering techniques, and integration workflows.

## Projects

### Create Project

```bash
operately projects create \
  --space-id s1 \
  --name "Q2 Product Roadmap" \
  --anonymous-access-level 0 \
  --company-access-level 10 \
  --space-access-level 70
```

### Get Project

```bash
operately projects get \
  --id p1 \
  --include-space \
  --include-milestones
```

### Update Project

```bash
operately projects update_name --project-id p1 --name "Q2 Roadmap"
operately projects update_description --project-id p1 --description "# Overview\n\nQ2 goals..."
operately projects update_due_date --project-id p1 --due-date 2024-06-30
```

### Milestones

```bash
# Create milestone
operately projects create_milestone \
  --project-id p1 \
  --name "Launch" \
  --due-date 2024-06-30

# List milestones
operately projects list_milestones --project-id p1

# Update milestone
operately projects update_milestone_title \
  --milestone-id m1 \
  --title "Public Launch"

operately projects update_milestone_due_date \
  --milestone-id m1 \
  --due-date 2024-07-15
```

### Project Check-ins

```bash
# Create check-in
operately projects create_check_in \
  --project-id p1 \
  --status on_track \
  --description "# Progress\n\nCompleted design phase."

# List check-ins
operately projects list_check_ins --project-id p1

# Acknowledge check-in
operately projects acknowledge_check_in --id ci1
```

### Contributors

```bash
# Add contributor
operately projects create_contributor \
  --project-id p1 \
  --person-id u1 \
  --responsibility "Design lead" \
  --permissions edit_access \
  --role reviewer

# List contributors
operately projects list_contributors --project-id p1

# Update contributor
operately projects update_contributor \
  --contrib-id c1 \
  --responsibility "Lead designer and UX researcher"
```

## Goals

### Create Goal

```bash
operately goals create \
  --space-id s1 \
  --name "Q2 Revenue Goal" \
  --champion-id u1 \
  --reviewer-id u2 \
  --anonymous-access-level 0 \
  --company-access-level 10 \
  --space-access-level 70
```

### Goal Hierarchy

```bash
# Create child goal
operately goals create \
  --space-id s1 \
  --name "Increase MRR" \
  --parent-goal-id g1 \
  --anonymous-access-level 0 \
  --company-access-level 10 \
  --space-access-level 70

# Update parent
operately goals update_parent_goal \
  --goal-id g2 \
  --parent-goal-id g1

# Search for parent goals
operately goals search_parent_goal --query "Revenue" --goal-id g1
```

### Targets

```bash
# Create target
operately goals create_target \
  --goal-id g1 \
  --name "Monthly Revenue" \
  --start-value 50000 \
  --target-value 100000 \
  --unit "USD"

# Update target value
operately goals update_target_value \
  --goal-id g1 \
  --target-id t1 \
  --value 75000
```

### Goal Check-ins

```bash
# Create check-in
operately goals create_check_in \
  --goal-id g1 \
  --status on_track \
  --due-date 2026-04-01 \
  --content "Making good progress on Q2 targets"

# List check-ins
operately goals list_check_ins --goal-id g1

# Acknowledge check-in
operately goals acknowledge_check_in --id ci1
```

### Goal Lifecycle

```bash
# Close goal
operately goals close \
  --goal-id g1 \
  --success achieved \
  --success-status achieved \
  --retrospective "# Retrospective\n\nWe exceeded our target."

# Reopen goal
operately goals reopen --id g1 --message "Reopening after new planning input."
```

## Tasks

### Create Task

```bash
operately tasks create \
  --type project \
  --id p1 \
  --milestone-id m1 \
  --name "Design mockups" \
  --assignee-id u1 \
  --due-date 2024-06-15
```

**Note:** Tasks require `--type` ("project" or "space") and `--id` (project or space ID) parameters.

### List Tasks

```bash
operately tasks list --project-id p1
```

### Update Task

```bash
# Update status
operately tasks update_status --task-id t1 --type project --status.id done --status.label "Done" --status.color green --status.index 2 --status.value done --status.closed true

# Update assignee
operately tasks update_assignee --task-id t1 --type project --assignee-id u2

# Update due date
operately tasks update_due_date --task-id t1 --type project --due-date 2024-06-20

# Update description
operately tasks update_description \
  --task-id t1 \
  --type project \
  --description "# Task Details\n\nCreate high-fidelity mockups."
```

### Move Task

```bash
# Move to different milestone
operately tasks update_milestone --task-id t1 --milestone-id m2

# Move with ordering
operately tasks update_milestone_and_ordering \
  --task-id t1 \
  --milestone-id m2 \
  --milestones-ordering-state.0.milestone-id m2 \
  --milestones-ordering-state.0.ordering-state.0 t1
```

## Spaces

### Create Space

```bash
operately spaces create \
  --name "Engineering" \
  --mission "Build great products" \
  --company-permissions 10 \
  --public-permissions 0
```

### Manage Members

```bash
# Add members
operately spaces add_members \
  --space-id s1 \
  --members.0.id u1 \
  --members.0.access-level 70 \
  --members.1.id u2 \
  --members.1.access-level 40

# List members
operately spaces list_members --space-id s1

# Remove member
operately spaces delete_member --space-id s1 --member-id u1

# Update permissions
operately spaces update_members_permissions \
  --space-id s1 \
  --members.0.id u1 \
  --members.0.access-level 70
```

### Space Tools

```bash
# List available tools
operately spaces list_tools --space-id s1

# Update enabled tools
operately spaces update_tools \
  --space-id s1 \
  --tools.tasks-enabled true \
  --tools.discussions-enabled true \
  --tools.resource-hub-enabled true
```

## Resource Hubs

See [Resource Hubs Reference](references/resource-hubs.md) for detailed workflows.

### Find Resource Hub ID

Every space already has a resource hub. To find the resource hub ID for a space:

```bash
operately spaces list_tools --space-id s1
```

Use the returned resource hub ID with `documents`, `links`, and `resource_hubs`.

### Folder Management

```bash
# Create folder at root
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Guides"

# Create nested folder
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Onboarding"

# Rename folder
operately resource_hubs rename_folder \
  --folder-id f1 \
  --new-name "Team Guides"

# Move folder
operately resource_hubs update_parent_folder \
  --resource-id f2 \
  --resource-type "folder" \
  --new-folder-id f1
```

### Documents

```bash
# Create document at root
operately documents create \
  --resource-hub-id rh1 \
  --name "Getting Started" \
  --content "# Getting Started\n\nWelcome to the team."

# Create document in folder
operately documents create \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Onboarding Guide" \
  --content "# Onboarding\n\nFirst steps..."

# Update document
operately documents update \
  --document-id d1 \
  --name "Updated Guide" \
  --content "# Updated Content"

# Publish draft
operately documents publish --document-id d1
```

### Links

```bash
# Create link at root
operately links create \
  --resource-hub-id rh1 \
  --name "Company Handbook" \
  --url "https://handbook.example.com" \
  --type "other"

# Create link in folder
operately links create \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Design System" \
  --url "https://design.example.com" \
  --type "other" \
  --description "Our design system documentation"
```

### List Contents

```bash
# List root contents
operately resource_hubs list_nodes --resource-hub-id rh1

# List folder contents
operately resource_hubs list_nodes --folder-id f1

# Include metadata
operately resource_hubs list_nodes \
  --resource-hub-id rh1 \
  --include-comments-count \
  --include-children-count
```

## Discussions

### Create Discussion

```bash
# Space discussion
operately spaces create_discussion \
  --space-id s1 \
  --title "Q2 Planning" \
  --body "# Q2 Planning\n\nLet's discuss priorities."

# Project discussion
operately projects create_discussion \
  --project-id p1 \
  --title "Architecture Review" \
  --message "# Architecture\n\nProposed changes..."

# Goal discussion
operately goals create_discussion \
  --goal-id g1 \
  --title "Target Adjustment" \
  --message "Should we revise our targets?"
```

### List Discussions

```bash
operately spaces list_discussions --space-id s1
operately projects list_discussions --project-id p1
operately goals list_discussions --goal-id g1
```

## Comments

```bash
# Create comment
operately comments create \
  --entity-id e1 \
  --entity-type "project_check_in" \
  --content "Great progress!"

# List comments
operately comments list --entity-id e1 --entity-type "project_check_in"

# Update comment
operately comments update --comment-id c1 --parent-type project_check_in --content "Updated comment"

# Delete comment
operately comments delete --comment-id c1 --parent-type project_check_in
```

## Notifications

```bash
# List notifications
operately notifications list

# Get unread count
operately notifications get_unread_count

# Mark as read
operately notifications mark_as_read --id n1

# Mark many as read
operately notifications mark_many_as_read \
  --ids n1 \
  --ids n2

# Mark all as read
operately notifications mark_all_as_read

# Check subscription status (uses resource-id)
operately notifications is_subscribed \
  --resource-id r1 \
  --resource-type project

# Get subscription-list-id from the resource first
operately projects get \
  --id r1 \
  --include-subscription-list

# Subscribe to resource (uses subscription-list-id from above)
operately notifications subscribe \
  --subscription-list-id <subscription-list-id> \
  --type project

# Unsubscribe from subscription list (uses subscription-list-id)
operately notifications unsubscribe \
  --subscription-list-id <subscription-list-id>
```

## People

```bash
# Get current user
operately people get_me

# Get user by ID
operately people get --id u1

# List people
operately people list

# Search people
operately people search --query "john"

# Update profile
operately people update \
  --id u1 \
  --title "Senior Engineer" \
  --manager-id u2
```

## Company

```bash
# Get company
operately companies get

# List companies
operately companies list

# Get work map
operately companies get_work_map

# Global search
operately companies global_search --query "roadmap"

# Create member
operately companies create_member \
  --full-name "John Doe" \
  --email "john@example.com" \
  --title "Engineer"
```

## Help System

The CLI provides built-in help at three levels:

**Namespace-level help** - List all commands in a namespace:
```bash
operately <namespace>
operately <namespace> --help
```

Examples:
```bash
operately projects
operately goals --help
```

Both forms display all available commands within that namespace.

**Command-level help** - Show command description and parameters:
```bash
operately <namespace> <command> --help
```

Examples:
```bash
operately projects create --help
operately goals update_target_value --help
```

This displays:
- Command description
- All required parameters (marked with `(required)`)
- All optional parameters
- Parameter types and formats

**General help:**
```bash
operately help
```

## Exit Codes

- `0` - Success
- `2` - CLI usage/validation error
- `3` - Missing authentication token/config
- `4` - API 4xx error (client error)
- `5` - API 5xx/network/fatal error (server error)

## Troubleshooting

### Authentication Failures

Check authentication setup:
```bash
operately auth status
operately auth whoami
```

If token is invalid or expired, login again:
```bash
operately auth login --token <new-token>
```

### Command Not Found

Verify CLI is installed:
```bash
command -v operately
npm list -g @operately/operately-cli
```

Update to latest version:
```bash
npm update -g @operately/operately-cli
operately --version
```

### API Errors

Use verbose mode to see request details:
```bash
operately projects get --id p1 --verbose
```

Check the API response for specific error messages.

### Missing Required Fields

Use help to see required flags:
```bash
operately help projects create
```

Required fields are marked with `(required)` in the help output.

## When to Use Other Skills

This is the primary skill for Operately CLI operations. Future skills may include:
- **operately-automation** - CI/CD integration patterns
- **operately-reporting** - Analytics and reporting workflows

## References

- [Project Workflows](references/project-workflows.md) - Project lifecycle and milestone management
- [Goal Workflows](references/goal-workflows.md) - OKR patterns and goal tracking
- [Task Workflows](references/task-workflows.md) - Task management best practices for projects and spaces
- [Space Workflows](references/space-workflows.md) - Space management, members, tools, and access control
- [Resource Hubs](references/resource-hubs.md) - Knowledge base organization
- [Collaboration Patterns](references/collaboration-patterns.md) - Team collaboration workflows
