# Data Layer Architecture

How Data Layers are stored on the backend. This is cross-cutting product context — read this before touching `backend/prisma/schema.prisma`, the data-layer module, or anything in the Builder's Data Layer.

## The two-schema model

Every Data Layer (DataForm, Board, Process) has **two backend schemas**:

```
┌──────────── METADATA SCHEMA ────────────┐    ┌────── RUNTIME DATA SCHEMA ──────┐
│ (stable, well-defined backend tables)    │    │ (derived from metadata)         │
│                                          │    │                                 │
│ Describes WHAT data layers exist:        │ ─▶ │ Holds the actual records that   │
│  - DataLayer definitions                 │    │ users / end-users transact      │
│  - Field definitions (name, type, etc.)  │    │ against at runtime              │
│  - Workflow step definitions             │    │                                 │
└──────────────────────────────────────────┘    └─────────────────────────────────┘
```

**Airtable analogy:** Airtable has a schema that describes the tables (metadata), and the tables themselves (runtime data). Same idea here.

## Target architecture: dynamic / physical schema

> **Decision:** when a user saves a Data Layer in the Builder, the backend **executes DDL** to create or alter a real physical table for that Data Layer. Each Field becomes a real column with its real type. Queries are straight SQL against real tables.

What this means concretely:

- **Metadata** is stored in stable Prisma-managed tables: `DataLayer`, `Field`, `WorkflowStep`.
- **Runtime data** is stored in **dynamically created tables** — one (or more) per Data Layer — whose shape is generated from the metadata.
- **Field operations trigger DDL:**
  - Add a field → `ALTER TABLE ... ADD COLUMN ...`
  - Rename a field → `ALTER TABLE ... RENAME COLUMN ...` (and update metadata mapping)
  - Change a field type → migration logic (coerce existing rows, or refuse if unsafe)
  - Delete a field → `ALTER TABLE ... DROP COLUMN ...` (with safety checks)
- **Querying is plain SQL against real tables.** Prisma cannot statically type these dynamic tables, so runtime queries will need a different access pattern (raw SQL, a query builder, or a per-Data-Layer Prisma client generated at runtime — TBD).

### Rejected alternative (for clarity)

We did **not** choose the JSON-blob model: a single generic `DataItem` table with `data: JSON` per row. That approach trades schema correctness and SQL queryability for setup simplicity. It is *not* the target architecture for this product.

## Current state vs target state

| | Metadata schema | Runtime data schema |
|---|---|---|
| **Current code** | `DataLayer`, `Field`, `WorkflowStep` in Prisma ✓ | `DataItem { data: JSON }` ✗ — JSON-blob model (legacy/placeholder) |
| **Target** | Same as today | Dynamically-generated physical tables per Data Layer |

**Migration is pending.** Anything an agent builds against `DataItem.data` today should be marked or treated as **interim**. New work should be designed with the dynamic-schema model in mind even when wired through `DataItem` temporarily.

## Dev vs Prod isolation (decided)

> **Decision:** Dev and Prod use **two physically separate databases** — `kissflow_dev_db` and `kissflow_prod_db`. May be revisited if a merged/shared-DB model becomes preferable in the future.

### What's where

```
┌────────────── PRODUCTION DB (kissflow_prod_db) ──────────────┐
│  - App identity (single row per app, status, audit fields)    │
│  - Metadata (DEPLOYED snapshot):                              │
│      DataLayer, Field, WorkflowStep, Navigation, Page, ...    │
│  - Dynamic runtime tables (REAL DATA)                         │
│  - User, RefreshToken (platform-level — see open Qs below)    │
└───────────────────────────────────────────────────────────────┘

┌────────────── DEV DB (kissflow_dev_db) ──────────────────────┐
│  - Metadata (BEING AUTHORED):                                 │
│      DataLayer, Field, WorkflowStep, Navigation, Page, ...    │
│      (each row references the App by ID from prod)            │
│  - Dynamic runtime tables (TEST DATA — throwaway by nature)   │
└───────────────────────────────────────────────────────────────┘
```

### App identity is single

The **App entity itself lives only once** — logically in prod, since "an app is always in Production." Dev DB does **not** carry its own copy of the App row. Dev metadata rows reference the App by its prod ID.

`App.status` (`draft / live / archived`) lives on this single row. A `draft` app exists in prod but has no deployed metadata or runtime tables yet — only dev does. After first publish, prod metadata + runtime tables come into being; status flips to `live`.

### Publish flow (high-level)

When the user publishes:

1. Copy metadata rows (DataLayer, Field, WorkflowStep, Navigation, Page, etc.) from `kissflow_dev_db` to `kissflow_prod_db` — replacing the deployed snapshot.
2. Execute DDL on `kissflow_prod_db` to make prod's dynamic runtime tables match the new metadata shape (add columns, drop columns, alter types, etc.).
3. Production runtime data is preserved during the DDL (subject to type-change rules — TBD).
4. Flip `App.status` to `live` if it was `draft`.

> **Rule:** Publish overrides production. It does not merge.

## Other open questions

Resolutions appended below as they're decided.

- **Where do User and RefreshToken live?** Likely the prod DB (or a dedicated platform DB), but not yet confirmed. Dev probably doesn't need its own User table.
- **How does dev look up an App?** If App lives only in prod, dev backend needs read access to prod's App table (cross-DB query, replication, or a control-plane service).
- **Table naming convention** for generated tables (per-app, per-data-layer slug, prefix?)
- **Field renames** — how do we tell apart a "rename column" from a "drop + add" at the metadata level? (Probably field IDs stay stable; names are display.)
- **Type changes** — strict (reject if existing data wouldn't coerce) or best-effort?
- **Concurrent edits** — what happens when two users in the Builder modify the same Data Layer at once?
- **Multi-tenancy** — are runtime tables per-tenant, per-app, or per-data-layer-only?
