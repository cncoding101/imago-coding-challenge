# IMAGO Media Search

A lightweight, in-memory media search engine built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

```bash
cd imago-app
bun install
bun run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). API docs are available at [http://localhost:3000/docs](http://localhost:3000/docs).

### Live Demo

**[https://imago-coding-challenge-wllw.vercel.app](https://imago-coding-challenge-wllw.vercel.app)**

### Other Commands

```bash
bun run build              # Production build
bun run lint               # Run ESLint
bun run format             # Format with Prettier
bun run generate:api       # Regenerate OpenAPI spec
bun run generate:client    # Regenerate Orval API client
bun run scripts/benchmark.ts   # Run search performance benchmark
bun run scripts/generate-dataset.ts  # Generate 10k synthetic dataset
```

## High-Level Approach

The core idea: preprocess messy metadata once at startup, build an inverted index, then answer queries by token lookup instead of scanning every item.

### Data Flow

```
Raw JSON → Entity transforms (parse dates, extract restrictions, normalize text)
         → In-memory index (inverted token map + item lookup map)
         → Query: tokenize → candidate lookup → score → filter → sort → paginate
```

## Assumptions

1. **Dataset as external source** — The JSON dataset represents data we'd receive from an external system (not our own database). We transform it into our internal schema (`MediaItem`) on load.

2. **Restriction tokens are structured** — Patterns like `PUBLICATIONxINxGERxSUIxAUTxONLY` use `x` as a delimiter. We extract country codes (e.g., `GER`, `SUI`, `AUT`) as filterable facets. Both `IN` (allowed) and `NOT IN` (excluded) patterns are handled.

3. **Archive IDs are noise** — Embedded identifiers like `UnitedArchives00421716` are stripped during text normalization since they don't add search value for end users.

4. **German and English content** — The dataset contains both languages. The tokenizer is language-agnostic (no stemming or language-specific stop words).

## Architecture

### Server — Clean Architecture

```
App Router (Controller) → Business Logic → Repository → Entities
```

- **App Router** (`src/app/api/`) — HTTP layer. Validates request params with Zod schemas, returns JSON responses. Each route exports schemas annotated with JSDoc for OpenAPI spec generation.
- **Business** (`src/business/`) — Orchestrates search: calls the repository for candidates, scores and ranks results, applies filters, handles pagination, records analytics.
- **Repository** (`src/repositories/`) — Manages the in-memory data store and inverted index. Provides query primitives (candidate lookup, token matching, filter application).
- **Entities** (`src/entities/`) — Pure data transformation functions. Converts `RawMediaItem` → `MediaItem`: date parsing, restriction extraction, text normalization, credit cleanup.

Information flows inward only, no layer calls upward. This makes the system easy to test in isolation and means swapping out a layer (e.g., replacing the in-memory repository with PostgreSQL) requires no changes to the layers above it. This creates an sorta onion layers.

### Frontend — Atomic Design

```
atoms → molecules → organisms → pages
```

- **Atoms**: Button, Text, Icon, LoadingSpinner
- **Molecules**: SearchInput, SortToggle, DatePicker, CreditSelector, RestrictionSelector
- **Organisms**: Navbar, GlobalErrorHandler
- **UI library**: shadcn/ui for base primitives (Input, Select, Badge)

### API Design

RESTful, resource-based endpoints:

| Endpoint            | Method | Purpose                                                      |
| ------------------- | ------ | ------------------------------------------------------------ |
| `/api/media/search` | GET    | Search with keyword, filters, sort, pagination               |
| `/api/media/facets` | GET    | Available filter options (credits, restrictions, date range) |
| `/api/analytics`    | GET    | Search usage metrics                                         |

API documentation is auto-generated from Zod schemas via `next-openapi-gen` and served through Scalar at `/docs`.

### Tooling

| Tool             | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| **Bun**          | Runtime and package manager                       |
| **Next.js**      | App Router for server + client                    |
| **Zod**          | Schema validation (request params, responses)     |
| **Orval**        | Auto-generates typed API client from OpenAPI spec |
| **React Query**  | Server state management with caching              |
| **Tailwind CSS** | Utility-first styling with design tokens          |
| **shadcn/ui**    | Accessible UI components                          |
| **Scalar**       | Interactive API documentation                     |

## Search & Relevance Strategy

### Preprocessing (Build Time)

All preprocessing happens once at startup when the index is built:

1. **Date parsing** — `DD.MM.YYYY` → `YYYY-MM-DD` (ISO format enables simple string comparison for range filtering)
2. **Restriction extraction** — Regex parses `PUBLICATIONxINx...` and `PUBLICATIONxNOTxINx...` patterns, extracts country codes as structured arrays
3. **Text normalization** — Strips restriction tokens and archive IDs from `suchtext`, lowercases, collapses whitespace
4. **Credit extraction** — Removes the `IMAGO / ` prefix from `fotografen`
5. **Inverted index** — Tokenizes all searchable fields (description, credit, imageNumber) and builds a `Map<token, Set<itemId>>` for O(1) candidate lookup

### Tokenization

The tokenizer lowercases text, splits on whitespace, then splits compound tokens on punctuation. For example, `"J.Morris"` produces both `"j.morris"` and its parts `["j", "morris"]`, so queries match either the compound or individual form.

### Scoring

Each result is scored by weighted field matching:

| Field         | Weight | Rationale                               |
| ------------- | ------ | --------------------------------------- |
| `imageNumber` | ×3     | Exact ID lookup — highest intent signal |
| `credit`      | ×2     | Agency/photographer search is targeted  |
| `description` | ×1     | Broadest field, most common matches     |

Prefix matching (3+ characters) is supported at half weight. This lets partial queries like `"manch"` find `"manchester"` while ranking exact matches higher.

Final sort: relevance score descending, then date descending as tiebreaker.

### Filtering

Filters are applied after candidate lookup and scoring:

- **Credit** — Case-insensitive exact match on photographer/agency
- **Date range** — ISO string comparison (`dateFrom`/`dateTo`)
- **Restrictions** — AND logic: item must contain all selected country codes

## Performance

### Benchmark Results (10,000 items)

```
Index build time: ~159ms (one-time at startup)

Search Latency (p50 / p95 / p99):
  Single keyword ("berlin")       7.3ms  /  9.8ms  / 11.0ms
  Two keywords ("berlin politik") 15.1ms / 18.4ms  / 20.2ms
  Prefix match ("ber")            12.3ms / 15.8ms  / 16.3ms
  Credit filter only               4.1ms /  6.9ms  /  8.9ms
  Keyword + filters combined       2.4ms /  4.2ms  /  4.6ms
  Empty query (all 10k items)     14.3ms / 20.1ms  / 23.9ms

Target: <100ms per query → PASS (standard UX benchmark)
```

### Why It's Fast

1. **Inverted index** — Token lookup is O(1) per token instead of scanning all 10k items
2. **Set-based candidates** — Union of token matches narrows the search space before scoring
3. **No serialization overhead** — In-memory Maps and Sets, no DB roundtrips
4. **One-time preprocessing** — Entity transforms and index construction happen at startup, not per-request

### Prefix Match Tradeoff

Prefix matching scans all index tokens (`O(n)` where `n` is the vocabulary size) to find tokens starting with the query. For 10k items this is fast (~12ms), but for millions of items this would become a bottleneck.

## Scaling to Millions of Items

The current in-memory approach works well for ~10k items but has clear limits. Here's how each concern would be addressed:

### Search Engine

**Migration path: Elasticsearch**

The inverted index pattern we use is exactly what Elasticsearch does at scale. Migration would be straightforward because our architecture already separates the search logic (business layer) from data access (repository layer). The repository would swap from in-memory Maps to Elasticsearch queries, no changes to the business layer or API contracts.

### Data Persistence

**PostgreSQL for structured storage**

The in-memory store means data is lost on restart and limited to available RAM. PostgreSQL would provide:

- Durable storage with ACID guarantees
- Efficient date range queries via B-tree indexes
- Full-text search via `tsvector`/`tsquery` as an intermediate step before adopting a dedicated search engine
- The Docker Compose already includes a PostgreSQL service for this purpose

### Continuous Ingestion ("New Items Every Minute")

```
New item arrives → Validate + transform (entity layer)
                 → Persist to database
                 → Update search index (incremental)
                 → Invalidate relevant caches
```

- **Incremental indexing**: Append new tokens to the inverted index without rebuilding. Our `buildTokenIndex` function already processes items individually — it would just run for the new item.
- **Queue-based ingestion**: A message queue (e.g., BullMQ with Redis) would decouple ingestion from indexing, ensuring the search API stays responsive while new items are processed.
- **Cache invalidation**: React Query's `staleTime` (currently 30s) would naturally pick up new items. For real-time needs, WebSocket push or server-sent events could notify the frontend.

### Analytics

For production, replace the in-memory analytics store with:

- **PostHog** or **Google Analytics** for user behavior tracking
- **Prometheus + Grafana** for server-side metrics (query latency, throughput, error rates)
- **Structured logging** for search quality analysis (query → results mapping)

## Trade-offs

| Decision                      | Chose                               | Over                              | Why                                                                                                |
| ----------------------------- | ----------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| In-memory index               | Speed, simplicity                   | Persistence, scalability          | Meets the 10k target easily; clean architecture means the repository can be swapped later          |
| No stemming/lemmatization     | Language-agnostic simplicity        | Better recall for inflected words | Mixed German/English corpus makes language-specific stemming unreliable without language detection |
| Scoring weights (3:2:1)       | Reasonable defaults                 | Tuned weights                     | No query logs to optimize against; weights are easy to adjust once real usage data exists          |
| No fuzzy/typo tolerance       | Exactness, speed                    | Better UX for misspellings        | Would add complexity; Elasticsearch handle this natively at scale                                  |
| Client-generated from OpenAPI | Type safety, single source of truth | Manual API client                 | Orval + Zod ensures frontend and backend stay in sync automatically                                |

## Limitations

- **No fuzzy matching** — Misspellings like "Manchster" won't match "Manchester." Prefix matching helps partially but isn't a substitute.
- **No German-specific text processing** — Umlauts work (ü, ö, ä) but compound words like "Bundestagswahl" won't match a search for "Bundestag" (no decompounding).
- **Data lost on restart** — The in-memory store rebuilds from the JSON file on each server start. Fine for a demo, not for production.
- **No concurrent write safety** — The analytics store uses simple mutation. Under high concurrent load, counts could drift. A production system would use atomic operations or a dedicated metrics backend.
- **Linear prefix scan** — Prefix matching checks all tokens in the index. Acceptable at 10k, would need optimization at scale. We have to loop through all tokens to find matches.

## Testing Approach

### Current

- **Benchmark script** (`scripts/benchmark.ts`) — Runs 100 iterations of each query type against the 10k dataset, measuring p50/p95/p99 latency. Validates the <100ms performance target.
- **Type safety as a testing layer** — Zod schemas validate every API request and response at runtime. The Orval-generated client ensures the frontend sends correctly typed requests. Type mismatches are caught at build time, not in production.
- **Manual exploratory testing** — The Scalar API docs at `/docs` provide an interactive playground for testing endpoints directly.

### What I Would Add

- **Unit tests** (Vitest) — Pure functions in the entities layer (`parseDate`, `extractRestrictions`, `normalizeText`, `extractCredit`) are ideal unit test candidates since they have no dependencies. The tokenizer and scoring logic in the business layer would also benefit from unit tests with known input/output pairs.
- **Integration tests** — Test the full search pipeline: given a known dataset, assert that specific queries return expected results in the correct order. This catches regressions in scoring, filtering, and pagination.
- **E2E tests** (Playwright) — Automate critical user flows: type a query, apply filters, paginate, verify results update. These catch frontend/backend integration issues.
- **CI pipeline** — Run linting, type checking, unit tests, and the benchmark on every PR to prevent regressions.

## What I Would Do Next

1. **Elasticsearch integration** — Replace the in-memory index for production-grade search with fuzzy matching, faceted filtering, and horizontal scaling
2. **PostgreSQL persistence** — Store media items durably with proper migrations
3. **Ingestion pipeline** — Queue-based processing for continuous new item arrival
4. **German NLP** — Compound word splitting, stemming, and synonym expansion
5. **CI/CD pipeline** — Automated linting, testing, and deployment
6. **E2E tests** — Playwright tests for critical search flows
7. **Image thumbnails** — Use `hoehe`/`breite` to render placeholder thumbnails with correct aspect ratios
8. **Vector search** — Qdrant for semantic similarity search alongside keyword search
