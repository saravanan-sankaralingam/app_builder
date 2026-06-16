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

Artifacts in the Data Layer are differentiated by their **workflow shape**. All three share a **structured schema** (per the dynamic / physical schema architecture).

| Artifact | Schema | Workflow |
|---|---|---|
| **DataForm** | Structured | None |
| **Board** | Structured | Unstructured |
| **Process** | Structured | Structured **approval** workflow |

**Verbatim definitions:**
- DataForm — *"a structured schema without any workflow"*
- Board — *"a structured schema with unstructured workflow"*
- Process — *"a structured schema with a structured approval workflow"*

The key differentiator is the workflow:
- **None** — records are just rows; no concept of "current step"
- **Unstructured** — records move between steps freely (any step → any step). Useful for Kanban-style tracking.
- **Structured approval** — records follow a predefined step sequence with **approval semantics** at each transition. (Not just "ordered steps" — approvals are the defining property.)

The Data Layer manages app data via the two-schema model on the backend — metadata (definitions) and runtime data (records). The target architecture is **dynamic / physical schema** (DDL executed on save), not JSON-blob. See [`../../docs/DATA_LAYER_ARCHITECTURE.md`](../../docs/DATA_LAYER_ARCHITECTURE.md) for the backend model.

> Detail on what each artifact looks like in the **Builder UI**, what the **Create dialogs** ask for, and how the **editor reads/writes metadata** is TBD. Additional Data Layer artifacts beyond these three (e.g. Dataset, noted earlier as a separate entity) will be added here as documented.

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
