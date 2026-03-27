# Resource Hubs

Resource hubs are knowledge repositories within spaces where teams can organize documents, links, and folders in a hierarchical structure.

## Resource Hub Concept

**What is a Resource Hub?**

A resource hub is a structured knowledge base that belongs to a space. It provides:
- Central location for team documentation
- Hierarchical folder organization
- Document management
- Link collection
- Access control

**Key Characteristics:**
- One resource hub per space
- Nested folder hierarchy (unlimited depth)
- Documents and links can be organized in folders
- Markdown support for documents
- Access levels inherited from space or customized

## Creating Resource Hubs

### Basic Resource Hub

```bash
operately resource_hubs create \
  --space-id s1 \
  --name "Team Documentation"
```

### Resource Hub with Description

```bash
operately resource_hubs create \
  --space-id s1 \
  --name "Engineering Knowledge Base" \
  --description "# Engineering Docs\n\nCentral repository for all engineering documentation, guides, and resources."
```

### Resource Hub with Access Control

```bash
operately resource_hubs create \
  --space-id s1 \
  --name "Leadership Documents" \
  --description "# Leadership Resources" \
  --anonymous-access-level 0 \
  --company-access-level 10 \
  --space-access-level 70
```

Access levels:
- `0` - No access
- `10` - View only
- `40` - Comment
- `70` - Edit
- `100` - Full access

### Getting Resource Hub

```bash
operately resource_hubs get --resource-hub-id rh1
```

## Folder Organization

### Creating Folders

**Create folder at root level:**
```bash
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Guides"
```

**Create nested folder:**
```bash
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Onboarding"
```

**Create deep hierarchy:**
```bash
# Level 1: Guides
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Guides"

# Level 2: Onboarding (inside Guides)
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --folder-id guides_folder_id \
  --name "Onboarding"

# Level 3: Engineering (inside Onboarding)
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --folder-id onboarding_folder_id \
  --name "Engineering Onboarding"
```

### Folder Operations

**Get folder details:**
```bash
operately resource_hubs get_folder --folder-id f1
```

**Rename folder:**
```bash
operately resource_hubs rename_folder \
  --folder-id f1 \
  --name "Team Guides"
```

**Delete folder:**
```bash
operately resource_hubs delete_folder --folder-id f1
```

**Copy folder:**
```bash
operately resource_hubs copy_folder \
  --folder-id f1 \
  --new-parent-folder-id f2
```

## Documents

### Creating Documents

**Create document at root:**
```bash
operately documents create \
  --resource-hub-id rh1 \
  --name "Getting Started" \
  --content "# Getting Started\n\nWelcome to the team! This guide will help you get up to speed.\n\n## First Steps\n1. Set up your development environment\n2. Read the architecture docs\n3. Join the team channels"
```

**Create document in folder:**
```bash
operately documents create \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Development Setup" \
  --content "# Development Environment Setup\n\n## Prerequisites\n- Node.js 18+\n- Docker\n- Git\n\n## Installation\n\`\`\`bash\nnpm install\ndocker-compose up\n\`\`\`"
```

**Create draft document:**
```bash
operately documents create \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Work in Progress" \
  --content "# Draft Document\n\nThis is still being written..." \
  --post-as-draft true
```

**Create document with notifications:**
```bash
operately documents create \
  --resource-hub-id rh1 \
  --name "Important Announcement" \
  --content "# New Policy\n\nPlease review the updated security policy." \
  --send-notifications-to-everyone true
```

**Create document with specific subscribers:**
```bash
operately documents create \
  --resource-hub-id rh1 \
  --name "Team Update" \
  --content "# Q2 Plans" \
  --subscriber-ids u1 \
  --subscriber-ids u2 \
  --subscriber-ids u3
```

### Managing Documents

**Get document:**
```bash
operately documents get --document-id d1
```

**Update document:**
```bash
operately documents update \
  --document-id d1 \
  --name "Updated Guide" \
  --content "# Updated Content\n\nRevised with latest information."
```

**Publish draft:**
```bash
operately documents publish --document-id d1
```

**Delete document:**
```bash
operately documents delete --document-id d1
```

## Links

### Creating Links

**Create link at root:**
```bash
operately links create \
  --resource-hub-id rh1 \
  --name "Company Handbook" \
  --url "https://handbook.example.com" \
  --type "external"
```

**Create link in folder:**
```bash
operately links create \
  --resource-hub-id rh1 \
  --folder-id f1 \
  --name "Design System" \
  --url "https://design.example.com" \
  --type "external" \
  --description "# Design System\n\nOur component library and design guidelines."
```

**Create link with notifications:**
```bash
operately links create \
  --resource-hub-id rh1 \
  --name "New Tool" \
  --url "https://tool.example.com" \
  --type "external" \
  --description "Check out our new project management tool" \
  --send-notifications-to-everyone true
```

### Managing Links

**Get link:**
```bash
operately links get --link-id l1
```

**Update link:**
```bash
operately links update \
  --link-id l1 \
  --name "Updated Link Title" \
  --url "https://new-url.example.com" \
  --description "Updated description"
```

**Delete link:**
```bash
operately links delete --link-id l1
```

## Moving Items Between Folders

### Move Document

```bash
operately resource_hubs update_parent_folder \
  --resource-id d1 \
  --resource-type "document" \
  --new-folder-id f2
```

### Move Link

```bash
operately resource_hubs update_parent_folder \
  --resource-id l1 \
  --resource-type "link" \
  --new-folder-id f2
```

### Move Folder

```bash
operately resource_hubs update_parent_folder \
  --resource-id f1 \
  --resource-type "folder" \
  --new-folder-id f2
```

### Move to Root

```bash
# Move to root by setting new-folder-id to null
operately resource_hubs update_parent_folder \
  --resource-id d1 \
  --resource-type "document" \
  --new-folder-id null
```

## Listing and Navigating Contents

### List Root Contents

```bash
operately resource_hubs list_nodes --resource-hub-id rh1
```

### List Folder Contents

```bash
operately resource_hubs list_nodes --folder-id f1
```

### List with Metadata

```bash
operately resource_hubs list_nodes \
  --resource-hub-id rh1 \
  --include-comments-count \
  --include-children-count
```

## Common Patterns

### Team Knowledge Base Pattern

```bash
# 1. Create resource hub
operately resource_hubs create \
  --space-id engineering_space \
  --name "Engineering Knowledge Base"

# 2. Create folder structure
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Onboarding"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Architecture"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Processes"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Tools & Resources"

# 3. Add onboarding documents
operately documents create \
  --resource-hub-id rh1 \
  --folder-id onboarding_folder \
  --name "Day 1 Guide" \
  --content "# Welcome!\n\n## Your First Day\n- Meet the team\n- Set up accounts\n- Review codebase"

operately documents create \
  --resource-hub-id rh1 \
  --folder-id onboarding_folder \
  --name "Development Setup" \
  --content "# Dev Environment\n\n[setup instructions]"

# 4. Add architecture docs
operately documents create \
  --resource-hub-id rh1 \
  --folder-id architecture_folder \
  --name "System Overview" \
  --content "# Architecture\n\n[system design]"

# 5. Add tool links
operately links create \
  --resource-hub-id rh1 \
  --folder-id tools_folder \
  --name "CI/CD Dashboard" \
  --url "https://ci.example.com" \
  --type "external"
```

### Project Documentation Pattern

```bash
# 1. Create resource hub for project
operately resource_hubs create \
  --space-id product_space \
  --name "Q2 Roadmap Resources"

# 2. Create project phases as folders
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Discovery"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Design"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Development"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Launch"

# 3. Add phase-specific content
operately documents create \
  --resource-hub-id rh1 \
  --folder-id discovery_folder \
  --name "User Research Findings" \
  --content "# Research Summary\n\n[findings]"

operately links create \
  --resource-hub-id rh1 \
  --folder-id design_folder \
  --name "Figma Mockups" \
  --url "https://figma.com/file/abc" \
  --type "external"
```

### Policy & Procedures Pattern

```bash
# 1. Create resource hub
operately resource_hubs create \
  --space-id company_space \
  --name "Policies & Procedures"

# 2. Create policy categories
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "HR Policies"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Security Policies"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Engineering Processes"

# 3. Add policies
operately documents create \
  --resource-hub-id rh1 \
  --folder-id hr_folder \
  --name "Time Off Policy" \
  --content "# Time Off\n\n## Vacation\n- 20 days per year\n- Request 2 weeks in advance"

operately documents create \
  --resource-hub-id rh1 \
  --folder-id security_folder \
  --name "Access Control Policy" \
  --content "# Access Control\n\n## Principles\n- Least privilege\n- Regular reviews\n- MFA required"
```

### Resource Library Pattern

```bash
# 1. Create resource hub
operately resource_hubs create \
  --space-id marketing_space \
  --name "Marketing Resources"

# 2. Create resource categories
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Brand Assets"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Templates"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Case Studies"

# 3. Add links to external resources
operately links create \
  --resource-hub-id rh1 \
  --folder-id brand_folder \
  --name "Logo Files" \
  --url "https://drive.google.com/logos" \
  --type "external"

operately links create \
  --resource-hub-id rh1 \
  --folder-id templates_folder \
  --name "Email Templates" \
  --url "https://templates.example.com" \
  --type "external"

# 4. Add internal documents
operately documents create \
  --resource-hub-id rh1 \
  --folder-id case_studies_folder \
  --name "Customer Success: Acme Corp" \
  --content "# Case Study\n\n[customer story]"
```

## Reorganization Workflows

### Restructuring Folders

```bash
# 1. Create new folder structure
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "New Structure"

operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --folder-id new_structure_id \
  --name "Subfolder A"

# 2. Move existing documents
operately resource_hubs update_parent_folder \
  --resource-id d1 \
  --resource-type "document" \
  --new-folder-id subfolder_a_id

operately resource_hubs update_parent_folder \
  --resource-id d2 \
  --resource-type "document" \
  --new-folder-id subfolder_a_id

# 3. Move existing folders
operately resource_hubs update_parent_folder \
  --resource-id old_folder_id \
  --resource-type "folder" \
  --new-folder-id new_structure_id

# 4. Delete empty old folders
operately resource_hubs delete_folder --folder-id empty_folder_id
```

### Consolidating Content

```bash
# 1. List all content
operately resource_hubs list_nodes --resource-hub-id rh1

# 2. Create consolidated folder
operately resource_hubs create_folder \
  --resource-hub-id rh1 \
  --name "Consolidated Guides"

# 3. Move related documents
operately resource_hubs update_parent_folder \
  --resource-id d1 \
  --resource-type "document" \
  --new-folder-id consolidated_id

operately resource_hubs update_parent_folder \
  --resource-id d2 \
  --resource-type "document" \
  --new-folder-id consolidated_id
```

## Gotchas

### Resource Hub per Space

Each space has one resource hub. You cannot create multiple resource hubs in the same space.

### Folder Hierarchy Depth

There's no technical limit on folder depth, but keep it shallow (3-4 levels max) for usability:
- Level 1: Main categories (Onboarding, Architecture, Processes)
- Level 2: Subcategories (Frontend, Backend, DevOps)
- Level 3: Specific topics (React Guide, API Design)
- Level 4: Detailed docs (rarely needed)

### Moving Items

When moving items between folders, the `resource-type` must be exact:
- `"document"` for documents
- `"link"` for links
- `"folder"` for folders

### Deleting Folders

Deleting a folder may delete its contents (documents, links, subfolders). Check the folder contents first:

```bash
operately resource_hubs list_nodes --folder-id f1
```

Move important items before deleting:

```bash
# Move items out first
operately resource_hubs update_parent_folder \
  --resource-id d1 \
  --resource-type "document" \
  --new-folder-id safe_folder_id

# Then delete folder
operately resource_hubs delete_folder --folder-id f1
```

### Document Drafts

Draft documents are visible to editors but not published to the team. Use drafts for work-in-progress:

```bash
# Create draft
operately documents create \
  --resource-hub-id rh1 \
  --name "WIP: New Policy" \
  --content "# Draft\n\nStill writing..." \
  --post-as-draft true

# Publish when ready
operately documents publish --document-id d1
```

### Link Types

The `--type` parameter for links is required. Common values:
- `"external"` - External URLs
- `"document"` - Links to other documents
- `"resource"` - Links to resources

### Access Control Inheritance

Resource hubs inherit access control from their space by default. Override with specific access levels:

```bash
operately resource_hubs create \
  --space-id s1 \
  --name "Restricted Docs" \
  --anonymous-access-level 0 \
  --company-access-level 0 \
  --space-access-level 70
```

### Markdown in Documents

Documents support full markdown including:
- Headings (`# H1`, `## H2`, etc.)
- Lists (`-` or `1.`)
- Links (`[text](url)`)
- Code blocks (` ``` `)
- Bold (`**text**`) and italic (`*text*`)

Use markdown for rich, readable documentation:

```bash
operately documents create \
  --resource-hub-id rh1 \
  --name "API Guide" \
  --content "# API Documentation\n\n## Authentication\n\nUse Bearer tokens:\n\n\`\`\`bash\ncurl -H 'Authorization: Bearer TOKEN' https://api.example.com\n\`\`\`\n\n## Endpoints\n\n### GET /users\n\nReturns all users.\n\n**Response:**\n\`\`\`json\n{\n  \"users\": [...]\n}\n\`\`\`"
```

### Notifications

Use `--send-notifications-to-everyone` sparingly. For targeted notifications, use `--subscriber-ids`:

```bash
# Notify specific people
operately documents create \
  --resource-hub-id rh1 \
  --name "Team Update" \
  --content "# Update" \
  --subscriber-ids u1 \
  --subscriber-ids u2
```

### Searching Content

Use the company global search to find documents and links:

```bash
operately companies global_search --query "onboarding"
```

This searches across all resource hubs, documents, and links in the company.
