# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **Runtime:** Bun — use `bun` for all commands (not npm/yarn)
- **Data:** In-memory dataset loaded from `imago-app/data/dataset.json` at startup
- **Search:** Lightweight in-memory search layer with inverted index (no external DB for the challenge)

## Development Commands

```bash
bun dev               # Start Next.js dev server
bun generate:api      # Generate OpenAPI spec from server
bun generate:client   # Generate Orval client and sync with API changes
```

## Architecture

### Frontend (imago-app)

#### Component Structure (Atomic Design)

`atoms` → `molecules` → `organisms` → `pages`

Always follow the atomic design pattern when creating or organizing components.

#### API Calls

- API calls live in `app/src/api/` and are generated with **Orval**
- All requests must use **React Query** with mutations
- Generated files under `app/src/api/generated/` are excluded from linting

#### Error Handling

- Use a **global error handler** — all errors should be propagated to this component by throwing an error

#### Utilities

- `imago-app/src/utils/` is the global utilities folder for constants, types, and helpers reused across multiple places

#### Styling

- `imago-app/src/app/globals.css` imports from `theme.css`, which contains the Tailwind theme
- Never hardcode color values — use design tokens
- Use shadcn/ui components for all UI elements
- Check existing components before creating new ones

### API Conventions

- Follow **RESTful** conventions — endpoints are named after resources (nouns, not verbs)
  - e.g., `/api/media/search`, `/api/media/facets` — not `/api/searchMedia`
- Use HTTP methods to express actions: `GET` for reads, `POST` for creates, `PUT`/`PATCH` for updates, `DELETE` for deletes
- Resource names should be plural (e.g., `/media`, `/users`)

### Server (Clean Architecture)

Follow a custom clean architecture approach with this flow:

```
App Router → Business → Repository → Entities
App Router → Business → Services → Entities
```

- **App Router (Controller):** `src/app/api/` — Returns responses and forwards to the appropriate business layer. Each route file must export **Zod schemas** for query params and responses, annotated with JSDoc tags (`@params`, `@response`) for `next-openapi-gen` spec generation.
- **Business:** `src/business/` — Contains business logic, orchestrates repository calls
- **Repository:** `src/repository/` — Manages data access (in-memory store, inverted index), calls entities for transformation
- **Entities:** `src/entities/` — Pure data transformation functions (e.g., `RawMediaItem → MediaItem`, date parsing, normalization)
- **Services:** `src/services/` — External service integrations

Information flows inward only — no layer communicates upward (e.g., business never calls the controller).
Repository calls entities for data transformation; business never calls entities directly.

## Linting Notes

- ESLint config in `app/` and `server/` uses FlatConfig (`eslint.config.ts`)
- Generated files under `app/src/api/generated/` are excluded from linting

## Design System

See [DESIGNSYSTEM.md](./DESIGNSYSTEM.md) for the full token reference, Figma link, and usage rules.
