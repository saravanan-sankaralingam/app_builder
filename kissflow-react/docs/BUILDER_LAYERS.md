# Builder: The 5 Layers

The App Builder is structured around **5 top-level Layers** — the same 5 from the product model in [`../../CLAUDE.md`](../../CLAUDE.md). They are the major segregation of the Builder UI.

> **Terminology rule:** these are called **Layers** everywhere — in the product model, the Builder UI, and the docs. Don't introduce alternate names ("sections", "pillars", "modules") for the same concept.

## The 5 Layers

| # | Layer | What it owns (high-level) |
|---|---|---|
| 1 | **Data** | DataForm, Board, Process — artifacts that own data |
| 2 | **Interface** | Views, Forms, Pages — how data is presented |
| 3 | **Logic** | Automations, Validations, Computed fields / formulas |
| 4 | **Roles & Permissions** | Role definitions, field-level permissions, step-level permissions (workflows only) |
| 5 | **Settings** | App configuration, integrations, notifications |

The Data Layer is the **foundation** — Interface, Logic, Roles, and Settings all reference data artifacts. Build order in the Builder typically follows this top-down sequence too.

## Per-Layer detail

Each Layer will be expanded in its own section below as we document the Builder iteratively.

### 1. Data

Artifacts: **DataForm**, **Board**, **Process**.

The Data Layer manages app data via a **two-schema model** on the backend — metadata (definitions) and runtime data (records derived from those definitions). The target architecture is **dynamic / physical schema** (DDL executed on save), not JSON-blob.

See [`../../docs/DATA_LAYER_ARCHITECTURE.md`](../../docs/DATA_LAYER_ARCHITECTURE.md) for the full model, current-vs-target state, and open architectural questions.

> Detail on what each artifact (DataForm / Board / Process) looks like in the Builder UI, what the Create dialogs ask for, and how the editor reads/writes metadata is TBD.

### 2. Interface
> *TBD — to be filled in.*

### 3. Logic
> *TBD — to be filled in.*

### 4. Roles & Permissions
> *TBD — to be filled in.*

### 5. Settings
> *TBD — to be filled in.*

## Scratch path: default state

When a user picks **Create from scratch** (see [`../../docs/APP_LIFECYCLE.md`](../../docs/APP_LIFECYCLE.md#creation-three-paths)) and lands in the Builder:

- **A default Navigation is created** (Interface Layer)
- **A default Page is created** (Interface Layer)
- All other Layers start empty — the user assembles them from there
