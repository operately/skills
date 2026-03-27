# Task Workflows

Task management best practices in Operately, covering task creation, assignment, status management, and organization patterns.

## Task Basics

### Creating Tasks

```bash
# Basic task
operately tasks create \
  --type project \
  --id p1 \
  --name "Design mockups" \
  --milestone-id m1 \
  --assignee-id null \
  --due-date null

# Task with assignee and due date
operately tasks create \
  --type project \
  --id p1 \
  --name "Implement login flow" \
  --milestone-id m1 \
  --assignee-id u1 \
  --due-date 2024-06-15

# Task with description
operately tasks create \
  --type project \
  --id p1 \
  --name "Write API documentation" \
  --milestone-id m1 \
  --assignee-id u2 \
  --due-date null \
  --description "# API Documentation\n\n## Endpoints to Document\n- /api/users\n- /api/projects\n- /api/goals"
```

**Note:** Tasks require `--type` ("project" or "space") and `--id` (project or space ID) parameters.

### Getting Task Details

```bash
operately tasks get --id t1
```

### Listing Tasks

```bash
# List tasks in a project
operately tasks list --project-id p1

# List tasks in a space
operately spaces list_tasks --space-id s1
```

## Task Assignment

### Assigning Tasks

```bash
# Assign to user
operately tasks update_assignee \
  --task-id t1 \
  --assignee-id u1

# Unassign (set to null)
operately tasks update_assignee \
  --task-id t1 \
  --assignee-id null
```

### Finding Potential Assignees

```bash
operately tasks list_potential_assignees --task-id t1
```

## Status Management

### Updating Task Status

```bash
# Mark as in progress
operately tasks update_status \
  --task-id t1 \
  --status-id in_progress

# Mark as completed
operately tasks update_status \
  --task-id t1 \
  --status-id completed

# Mark as blocked
operately tasks update_status \
  --task-id t1 \
  --status-id blocked
```

### Custom Status Workflows

Task statuses are project-specific. Get available statuses:

```bash
operately projects get \
  --project-id p1 \
  --include-task-statuses
```

Update project task statuses:

```bash
operately projects update_task_statuses \
  --project-id p1 \
  --task-statuses.0.id ts1 \
  --task-statuses.0.label "To Do" \
  --task-statuses.1.id ts2 \
  --task-statuses.1.label "In Progress" \
  --task-statuses.2.id ts3 \
  --task-statuses.2.label "In Review" \
  --task-statuses.3.id ts4 \
  --task-statuses.3.label "Done"
```

## Task Updates

### Updating Task Name

```bash
operately tasks update_name \
  --task-id t1 \
  --name "Updated task name"
```

### Updating Task Description

```bash
operately tasks update_description \
  --task-id t1 \
  --description "# Updated Description\n\n## Details\nAdditional context and requirements."
```

### Updating Due Date

```bash
# Set due date
operately tasks update_due_date \
  --task-id t1 \
  --due-date 2024-06-20

# Remove due date
operately tasks update_due_date \
  --task-id t1 \
  --due-date null
```

## Task Organization

### Moving Tasks Between Milestones

```bash
# Simple move
operately tasks update_milestone \
  --task-id t1 \
  --milestone-id m2

# Move with specific ordering
operately tasks update_milestone_and_ordering \
  --task-id t1 \
  --milestone-id m2 \
  --new-position 0
```

### General Task Movement

```bash
operately tasks move \
  --task-id t1 \
  --new-milestone-id m2
```

### Deleting Tasks

```bash
operately tasks delete --task-id t1
```

## Task Patterns

### Sprint Planning Pattern

```bash
# 1. Create sprint milestone
operately projects create_milestone \
  --project-id p1 \
  --name "Sprint 5" \
  --due-date 2024-06-15

# 2. Create sprint backlog
operately tasks create \
  --name "User story: Login with SSO" \
  --milestone-id m5 \
  --assignee-id u1 \
  --description "# User Story\n\nAs a user, I want to login with SSO so that I don't need another password.\n\n## Acceptance Criteria\n- Google OAuth integration\n- Microsoft OAuth integration\n- Fallback to email/password"

operately tasks create \
  --name "User story: Dashboard widgets" \
  --milestone-id m5 \
  --assignee-id u2

operately tasks create \
  --name "Bug: Fix pagination" \
  --milestone-id m5 \
  --assignee-id u3

# 3. Daily updates
operately tasks update_status --task-id t1 --status-id in_progress
operately tasks update_status --task-id t2 --status-id completed

# 4. Sprint end
operately tasks update_status --task-id t3 --status-id completed
```

### Kanban Board Pattern

```bash
# 1. Set up custom statuses
operately projects update_task_statuses \
  --project-id p1 \
  --task-statuses.0.label "Backlog" \
  --task-statuses.1.label "Ready" \
  --task-statuses.2.label "In Progress" \
  --task-statuses.3.label "Review" \
  --task-statuses.4.label "Done"

# 2. Create tasks in backlog
operately tasks create --name "Feature A" --milestone-id m1
operately tasks create --name "Feature B" --milestone-id m1
operately tasks create --name "Feature C" --milestone-id m1

# 3. Move through workflow
operately tasks update_status --task-id t1 --status-id ready
operately tasks update_status --task-id t1 --status-id in_progress
operately tasks update_status --task-id t1 --status-id review
operately tasks update_status --task-id t1 --status-id done
```

### Bug Tracking Pattern

```bash
# 1. Create bug tasks
operately tasks create \
  --name "Bug: Login fails on Safari" \
  --milestone-id bugs_milestone \
  --description "# Bug Report\n\n## Steps to Reproduce\n1. Open Safari\n2. Go to login page\n3. Enter credentials\n4. Click login\n\n## Expected\nUser logs in\n\n## Actual\nError message appears\n\n## Priority\nHigh"

# 2. Assign to developer
operately tasks update_assignee --task-id t1 --assignee-id u1

# 3. Track progress
operately tasks update_status --task-id t1 --status-id in_progress

# 4. Mark as fixed
operately tasks update_status --task-id t1 --status-id completed
operately tasks update_description \
  --task-id t1 \
  --description "# Bug Report\n\n[original description]\n\n## Resolution\nFixed Safari-specific cookie handling issue. Deployed in v1.2.3."
```

## Task Comments and Collaboration

### Adding Comments

```bash
operately comments create \
  --entity-id t1 \
  --entity-type "task" \
  --content "Started working on this. Will have it done by EOD."

operately comments create \
  --entity-id t1 \
  --entity-type "task" \
  --content "Blocked on API access. Need credentials from DevOps."
```

### Listing Comments

```bash
operately comments list \
  --entity-id t1 \
  --entity-type "task"
```

## Task Metrics and Reporting

### Listing Tasks by Status

Get all tasks and filter by status in your script:

```bash
# Get all tasks and process with jq or similar
operately tasks list --project-id p1 --compact | jq '.[] | select(.status == "in_progress")'
```

### Listing Tasks by Assignee

```bash
# Get user's assignments
operately people list_assignments --person-id u1

# Get assignment count
operately people get_assignments_count --person-id u1
```

## Gotchas

### Task Status IDs

Task statuses are project-specific. Always get the project's status IDs first:

```bash
operately projects get --id p1 --include-task-statuses
```

Don't assume status IDs like "completed" or "in_progress" - use the actual IDs from the project.

### Milestone Association

Tasks can be associated with a milestone or not. However, they must belong to either a project or space.

### Due Dates Are Optional

Due dates are optional but recommended for prioritization.

### Assignee vs Creator

The task creator and assignee can be different people. Use `--assignee-id` to assign to someone else.

### Task Descriptions Support Markdown

Use markdown for rich task descriptions:

```bash
operately tasks create \
  --name "Complex feature" \
  --milestone-id m1 \
  --description "# Feature: Advanced Search\n\n## Requirements\n- Full-text search\n- Filters by date, author, type\n- Sort options\n\n## Technical Notes\n- Use Elasticsearch\n- Index updates via queue\n\n## Acceptance Criteria\n- [ ] Search returns relevant results\n- [ ] Filters work correctly\n- [ ] Performance < 200ms"
```
