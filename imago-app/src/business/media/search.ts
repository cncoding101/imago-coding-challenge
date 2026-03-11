import { recordSearch } from '@/repositories/analytics';
import {
	tokenize,
	findCandidateIds,
	findMatchedIndexTokens,
	getMediaItemById,
	hasExactTokenMatch,
	matchesFilters
} from '@/repositories/media';
import type { MediaFilterCriteria } from '@/repositories/media';
import { MediaItem, SearchQuery, SearchResult } from '@/schemas/media';

// ── Scoring weights ───────────────────────────────────────────────────

const WEIGHT_DESCRIPTION = 1;
const WEIGHT_CREDIT = 2;
const WEIGHT_IMAGENUMBER = 3;

/** Score a single item against query tokens using weighted field matching + prefix support. */
const scoreItem = (item: MediaItem, queryTokens: string[]): number => {
	if (queryTokens.length === 0) return 1;

	let score = 0;

	const descTokens = tokenize(item.description);
	const creditTokens = tokenize(item.credit);
	const imageTokens = tokenize(item.imageNumber);

	for (const qt of queryTokens) {
		const hasExact = hasExactTokenMatch(qt, item.id);

		if (hasExact) {
			if (descTokens.includes(qt)) score += WEIGHT_DESCRIPTION;
			if (creditTokens.includes(qt)) score += WEIGHT_CREDIT;
			if (imageTokens.includes(qt)) score += WEIGHT_IMAGENUMBER;
		}

		// Prefix matching (3+ chars, only when no exact match)
		if (!hasExact && qt.length >= 3) {
			for (const dt of descTokens) {
				if (dt.startsWith(qt)) {
					score += WEIGHT_DESCRIPTION * 0.5;
					break;
				}
			}
			for (const ct of creditTokens) {
				if (ct.startsWith(qt)) {
					score += WEIGHT_CREDIT * 0.5;
					break;
				}
			}
			for (const bt of imageTokens) {
				if (bt.startsWith(qt)) {
					score += WEIGHT_IMAGENUMBER * 0.5;
					break;
				}
			}
		}
	}

	return score;
};

/** Execute a search: find candidates from repo, score, filter, sort, paginate. */
export const searchItems = (params: SearchQuery): SearchResult => {
	const startTime = performance.now();

	const query = params.query.trim();
	const page = Math.max(1, params.page ?? 1);
	const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
	const sortBy = params.sortBy ?? 'relevance';

	const queryTokens = query ? tokenize(query) : [];

	// 1. Get candidate IDs from repository
	const candidateIds = findCandidateIds(queryTokens);

	// 2. Build filter criteria
	const filters: MediaFilterCriteria = {
		credit: params.credit,
		dateFrom: params.dateFrom,
		dateTo: params.dateTo,
		restrictions: params.restrictions
	};

	// 3. Score candidates and apply filters
	const scored: { item: MediaItem; score: number }[] = [];

	for (const id of candidateIds) {
		const item = getMediaItemById(id);
		if (!item) continue;

		if (!matchesFilters(item, filters)) continue;

		const score = scoreItem(item, queryTokens);
		if (query && score === 0) continue;

		scored.push({ item, score });
	}

	// 4. Sort
	if (sortBy === 'date_asc') {
		scored.sort((a, b) => a.item.date.localeCompare(b.item.date));
	} else if (sortBy === 'date_desc') {
		scored.sort((a, b) => b.item.date.localeCompare(a.item.date));
	} else {
		scored.sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date));
	}

	// 5. Paginate
	const total = scored.length;
	const totalPages = Math.ceil(total / pageSize);
	const start = (page - 1) * pageSize;
	const items = scored.slice(start, start + pageSize).map((s) => s.item);

	// 6. Track analytics
	const elapsed = performance.now() - startTime;
	const matchedTokens = query ? findMatchedIndexTokens(queryTokens) : [];
	recordSearch(query, matchedTokens, elapsed);

	return { items, page, pageSize, total, totalPages };
};
