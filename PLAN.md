# IMAGO Media Search — Project Plan

## Phase 1: Project Setup & Data Modeling

- [x] Initialize Next.js app with TypeScript and Tailwind CSS
- [x] Define TypeScript interfaces for raw media items (`RawMediaItem`) and processed items (`MediaItem`)
- [x] Create the sample dataset (expand to ~50 items for dev, generate 10k+ for perf testing)

## Phase 2: Preprocessing & Indexing

- [x] Parse `datum` from `DD.MM.YYYY` → ISO `YYYY-MM-DD`
- [x] Extract restriction tokens from `suchtext` (regex for `PUBLICATIONxINx...` patterns, normalize `x` delimiters)
- [x] Normalize `suchtext`: lowercase, strip restriction tokens, collapse whitespace
- [x] Extract credit/agency from `fotografen` (strip `IMAGO /` prefix)
- [x] Build an inverted index: token → Set of item IDs (at startup / build time)
- [x] Compute unique filter facets (credits list, restrictions list, date range bounds)
- [x] Write a seed script to generate 10k+ synthetic items for performance testing

## Phase 3: Search Engine (Server-Side Logic)

- [x] Implement tokenizer: lowercase, split on whitespace/punctuation, remove stop words
- [x] Implement keyword search with weighted scoring (`suchtext` ×3, `fotografen` ×2, `bildnummer` ×1)
- [x] Support prefix matching (e.g., "manch" matches "manchester")
- [x] Implement filters: credit (exact match), date range (from/to), restrictions (multi-select, AND/OR)
- [x] Implement sorting by `datum` (asc/desc), default relevance sort
- [x] Implement pagination: `page`, `pageSize`, return `total` and `totalPages`
- [x] Write the `GET /api/search` route with query params

## Phase 4: Analytics (In-Memory)

- [x] Track total search count
- [x] Track per-request response time (server-side `performance.now()`)
- [x] Track keyword frequency map (top N keywords)
- [x] Expose `GET /api/analytics` endpoint for dashboard/debugging

## Phase 5: Frontend UI

- [x] Search bar with debounced input (300ms)
- [x] Filters panel: credit dropdown/autocomplete, date range picker, restriction chips (multi-select)
- [x] Sort toggle button (date asc/desc/relevance)
- [x] Results grid/list showing `bildnummer`, `fotografen`, `datum`, and highlighted `suchtext` snippet
- [x] Pagination controls (prev/next, page indicator)
- [x] UI states: loading spinner, empty results message, error state
- [x] Accessibility: labels, focus rings, keyboard navigation

## Phase 6: Performance & Scaling Documentation

- [x] Benchmark search latency on 10k dataset, confirm <100ms target
- [x] Write scaling strategy section (Elasticsearch/Meilisearch migration, DB-backed storage, incremental indexing)
- [x] Document "new items every minute" ingestion approach (append + incremental index update)
- [x] Document trade-offs (in-memory vs persistent, exact vs fuzzy matching)

## Phase 7: Documentation & Deliverables

- [x] Write `README.md` (approach, assumptions, design decisions, limitations, "what's next")
- [ ] Generate the PDF deliverable covering: architecture overview, search/relevance strategy, preprocessing, scaling, testing approach, trade-offs
- [x] Ensure app runs locally with `bun install && bun run dev`
- [x] Deploy to Vercel — [https://imago-coding-challenge-wllw.vercel.app](https://imago-coding-challenge-wllw.vercel.app)
- [x] Final review and cleanup
