# App Lifecycle

This doc covers the full lifecycle of an app — from creation through editing, deployment, archival, and deletion. It cuts across the **Platform** (which owns creation and listing) and the **App Builder** (which owns editing inside the dev sandbox).

## Where apps live: Dev vs Production

Two environments with strict boundaries:

```
┌────────────────────── DEV (sandbox) ──────────────────────┐
│                                                            │
│   App Builder (authoring UI)                               │
│   ├── edits app's frontend + backend layers                │
│   └── runs in the sandbox                                  │
│                                                            │
│   Apps in dev can be edited in parallel — independently    │
│   of what's already live in production                     │
└────────────────────────────────────────────────────────────┘
                            │
                            │ publish (overrides prod copy)
                            ▼
┌──────────────────── PRODUCTION (live) ────────────────────┐
│   Deployed snapshot — frontend + backend                   │
│   Not editable directly. Untouched until next publish.     │
└────────────────────────────────────────────────────────────┘
```

### Rules (verbatim)

> *"Editing in dev does not affect production. Publishing to production overrides production."*

- Apps can **only be created from the Platform**; never from inside the Builder.
- Apps can **only be edited in the dev environment**, via the App Builder.
- Dev edits proceed in parallel with what's already live; production stays untouched until the next publish.
- Publish is an **override** of the production copy, not a merge.

## App status states

`App.status` is one of `draft / live / archived` (see `backend/prisma/schema.prisma`). The flow:

```
draft  ──(deploy)──▶  live  ──(archive)──▶  archived  ──(delete)──▶  permanently deleted
                       │                                              (hard delete)
                       │
                       └─(keep editing in dev; prod untouched until next deploy)
```

- **draft** — initial state on creation; only exists in dev
- **live** — has been deployed to production at least once; dev copy may have unpublished changes
- **archived** — soft-archived; can be restored or hard-deleted
- **permanently deleted** — hard delete from the database

## Creation: three paths

Apps can only be created from the **Platform's New App** entry point. The user chooses one of three paths:

| Path | Input | Builder landing state |
|---|---|---|
| **Build using AI** | Prompt or PRD document | Fully-functional app per the spec, with preview. *(Currently mocked; revisit later.)* |
| **Use template** | Pick from App Template library (boilerplate apps, functional to some extent) | Pre-built app from template, ready to improvise |
| **Create from scratch** | Nothing | Builder loaded with a **default Navigation and a default Page** — user assembles the rest of the app from there |

All three paths route to the Builder; what differs is the **initial state** of the app the user lands on.

## Edit and publish

### App identity vs metadata vs runtime data

The App identity is **single**; metadata and runtime data are **dual** (dev + prod copies).

| | App identity | Metadata (DataLayer, Field, etc.) | Runtime data |
|---|---|---|---|
| **Lives in** | Prod DB (single row) | Both dev DB *and* prod DB (independent copies) | Both dev DB (test data) *and* prod DB (real data), as dynamic tables |
| **Edited from** | Platform (create/archive only) | Builder, in dev | Dev: by user testing in sandbox. Prod: by end-users at runtime. |
| **On publish** | `status` may flip `draft → live` | Dev metadata is **copied to prod**, replacing the deployed snapshot | Prod runtime tables get DDL applied to match new metadata shape |

> **Rule:** *"Editing in dev does not affect production. Publishing to production overrides production."* — applies to both metadata and runtime table shape, not to runtime data values (prod data is preserved across DDL where safe).

See [`DATA_LAYER_ARCHITECTURE.md`](DATA_LAYER_ARCHITECTURE.md#dev-vs-prod-isolation-decided) for the full two-DB model.

### What "running the app in dev" means

The Builder's Play mode runs the app inside the dev sandbox. Any data the user enters while testing goes into the dev DB's runtime tables — **this is always test data**, regardless of how it looks. It is not visible to or shared with production.

## Archive and delete

- Any app can be archived (regardless of `draft` or `live` status).
- Archived apps can then be permanently deleted — this is a **hard delete** (the row is removed; not recoverable).
