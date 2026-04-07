# Kissflow App Builder

## Product Overview

A low-code application development platform where users can create and build apps using a visual builder. The platform uses meta-based generation to define app structure and behavior.

**Key Concepts:**
- **App Builder**: Visual low-code interface for creating applications
- **Development Sandbox**: Apps are built and tested in a dev environment
- **Production Deployment**: Once changes are finalized, apps are deployed to production
- **Preview in Dev**: Apps can run in the development environment before deployment, allowing testing of undeployed changes

```
┌─────────────────┐      ┌─────────────────┐
│   App Builder   │ ──── │  Dev Sandbox    │ ──── Deploy ──── Production
│  (Low-code UI)  │      │  (Test/Preview) │
└─────────────────┘      └─────────────────┘
```

## App Construction Layers

Apps are built using 5 main layers, each with sub-components:

```
┌─────────────────────────────────────────────────────────────┐
│                        APP LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│  1. DATA LAYER (Foundation)                                 │
│     ├── DataForm - Data without workflows                   │
│     ├── Board - Data with unstructured workflow             │
│     │           (items can move to any step freely)         │
│     └── Process - Data with structured workflow             │
│                   (items follow predefined step sequence)   │
├─────────────────────────────────────────────────────────────┤
│  2. INTERFACE LAYER                                         │
│     ├── Views (Table, Kanban, Gallery, Calendar, etc.)      │
│     ├── Forms (Create, Edit, View)                          │
│     └── Pages                                               │
├─────────────────────────────────────────────────────────────┤
│  3. LOGIC LAYER                                             │
│     ├── Automations                                         │
│     ├── Validations                                         │
│     └── Computed Fields / Formulas                          │
├─────────────────────────────────────────────────────────────┤
│  4. ROLES & PERMISSIONS LAYER                               │
│     ├── Role Definitions                                    │
│     ├── Field-level Permissions                             │
│     └── Step-level Permissions (for workflows)              │
├─────────────────────────────────────────────────────────────┤
│  5. SETTINGS LAYER                                          │
│     ├── App Configuration                                   │
│     ├── Integrations                                        │
│     └── Notifications                                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Layer Types

| Type | Description | Workflow |
|------|-------------|----------|
| **DataForm** | Simple data collection (like a database table) | None |
| **Board** | Kanban-style tracking with flexible workflow | Unstructured (any step → any step) |
| **Process** | Formal workflow with defined transitions | Structured (predefined step sequence) |

### Data Layer Database Design

Each app can have multiple data layers. Items are stored with dynamic JSON data:

```
App (1) ──── (N) DataLayer ──── (N) Field       # Schema definition
                    │
                    └──── (N) WorkflowStep     # For board/process
                    │
                    └──── (N) DataItem         # Actual data records
```

- **DataLayer**: Container for a form/board/process within an app
- **Field**: Field definitions (name, type, options, validation)
- **WorkflowStep**: Workflow steps with transitions (board allows all, process restricts)
- **DataItem**: Actual data stored as JSON with reference to current step

## Quick Start

```bash
# Frontend
cd kissflow-react
npm run dev          # Start dev server on port 3001

# Backend
cd backend
npm run dev          # Start API server on port 3000
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Architecture

### Frontend (kissflow-react/)
- **Next.js 16** with App Router
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS v4** for styling
- **Radix UI** components (shadcn/ui pattern)

### Backend (backend/)
- **Fastify 5** REST API
- **Prisma 6** with PostgreSQL
- **JWT** authentication (access + refresh tokens)

### Layout System
CSS Grid layout in `kissflow-react/components/layout/AppLayout.tsx`:
```
┌─────────────────────────────────────┐
│ TopBar (3.5rem height, full width)  │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content             │
│ (3.5rem) │ (scrolls independently)  │
└──────────┴──────────────────────────┘
```

## Project Structure

```
kissflow-react/           # Frontend
├── app/                  # Next.js pages (App Router)
│   ├── page.tsx         # Home page
│   ├── explorer/        # App explorer
│   ├── create/          # App creation flow
│   ├── my-items/        # User's items
│   └── store/           # Marketplace
├── components/
│   ├── layout/          # AppLayout, TopBar, Sidebar
│   ├── ui/              # Radix UI components
│   ├── explorer/        # Explorer page components
│   ├── create/          # App creation components
│   └── views/           # View type components
└── lib/
    ├── api/             # API client
    ├── icons/           # Custom icons
    └── utils.ts         # Utility functions (cn, etc.)

backend/                  # Backend
├── src/
│   ├── modules/
│   │   ├── app/         # App CRUD endpoints
│   │   └── auth/        # Authentication endpoints
│   ├── config/          # Environment config
│   ├── middleware/      # Auth middleware
│   └── utils/           # Utilities
└── prisma/
    └── schema.prisma    # Database schema
```

## Code Style

- **TypeScript**: Strict mode, path alias `@/*` → `./`
- **Components**: Client components use `'use client'` directive
- **Styling**: Tailwind CSS utility classes, `cn()` for conditional classes
- **State**: React hooks, URL search params for navigation state

## Database Models

```prisma
# Core Models
User           # id, email, name, password, role (admin/member/viewer)
App            # id, name, slug, type (app/portal), status (draft/live/archived)
RefreshToken   # JWT refresh token management

# Data Layer Models
DataLayer      # id, appId, name, slug, type (dataform/board/process)
Field          # id, dataLayerId, name, slug, type, required, options, config, order
WorkflowStep   # id, dataLayerId, name, slug, color, order, allowedNextSteps
DataItem       # id, dataLayerId, data (JSON), currentStepId, createdById, updatedById
```

## Testing

```bash
# Frontend
cd kissflow-react
npm run lint         # ESLint
npm run build        # Type check + build

# Backend
cd backend
npm run lint
npm run build
```
- # BuilderUtilityBar Buttons by Tab Type

| Tab Type | Views | Reports | Share | Settings | Save | More |
|----------|-------|---------|-------|----------|------|------|
| DataForm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Board | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Process | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| List | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Page | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Navigation | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Home | - | - | - | - | - | - |
| Variables | - | - | - | - | - | - |
| Resources | - | - | - | - | - | - |

### Legend
- ✓ = Button is visible
- ✗ = Button is hidden
- \- = No action bar shown"  can you update this content in this folder '/Users/saravanansankaralingam/Desktop/App Runtime Experience/kissflow-react/ComponentsProperties.md' and also add the component utility bar's as well