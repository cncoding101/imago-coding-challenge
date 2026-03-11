import { toMediaItem } from '@/entities/media';
import type { RawMediaItem } from '@/entities/media';
import { MediaItem } from '@/schemas/media';
import rawDataset from '../../data/dataset.json';

// ── Data types ────────────────────────────────────────────────────────

export interface MediaIndex {
	items: Map<string, MediaItem>;
	tokenIndex: Map<string, Set<string>>;
	credits: string[];
	restrictions: string[];
	dateRange: { min: string; max: string };
}

export interface MediaFilterCriteria {
	credit?: string;
	dateFrom?: string;
	dateTo?: string;
	restrictions?: string[];
}

export interface MediaFacets {
	credits: string[];
	restrictions: string[];
	dateRange: { min: string; max: string };
}

// ── Tokenization ──────────────────────────────────────────────────────

/** Tokenize text: lowercase, split on whitespace, then split compound tokens on punctuation.
 *  Emits both the compound form (e.g. "j.morris") and its parts ("j", "morris")
 *  so searches match either way. */
export const tokenize = (text: string): string[] => {
	const tokens: string[] = [];
	const words = text.toLowerCase().split(/\s+/).filter(Boolean);

	for (const word of words) {
		// Strip leading none letter, digit, or underscore
		const trimmed = word.replace(/^[^\w]+|[^\w]+$/g, '');
		if (!trimmed) continue;

		tokens.push(trimmed);

		// Split on inner punctuation and emit sub-tokens if the word is compound
		const parts = trimmed.split(/[.,;:!?()[\]{}'"\/\\-]+/).filter(Boolean);
		if (parts.length > 1) {
			// Example: "j.morris" → ["j", "morris"]
			tokens.push(...parts);
		}
	}

	return tokens;
};

// ── Index construction ────────────────────────────────────────────────

/** Build inverted index from processed items. */
const buildTokenIndex = (items: MediaItem[]): Map<string, Set<string>> => {
	const index = new Map<string, Set<string>>();

	const addTokens = (tokens: string[], itemId: string) => {
		for (const token of tokens) {
			const existing = index.get(token);
			if (existing) {
				existing.add(itemId);
			} else {
				index.set(token, new Set([itemId]));
			}
		}
	};

	// tokenize
	for (const item of items) {
		addTokens(tokenize(item.description), item.id);
		addTokens(tokenize(item.credit), item.id);
		addTokens(tokenize(item.imageNumber), item.id);
	}

	return index;
};

/** Compute unique filter facets from processed items. */
const computeFacets = (items: MediaItem[]): MediaFacets => {
	const creditSet = new Set<string>();
	const restrictionSet = new Set<string>();
	let minDate = items[0]?.date ?? '';
	let maxDate = items[0]?.date ?? '';

	for (const item of items) {
		creditSet.add(item.credit);
		for (const r of item.restrictions) {
			restrictionSet.add(r);
		}
		if (item.date < minDate) minDate = item.date;
		if (item.date > maxDate) maxDate = item.date;
	}

	return {
		credits: [...creditSet].sort(),
		restrictions: [...restrictionSet].sort(),
		dateRange: { min: minDate, max: maxDate }
	};
};

// ── Singleton index ───────────────────────────────────────────────────

const globalMedia = globalThis as unknown as { __mediaIndex?: MediaIndex };

/** Get or initialize the media index. */
const getIndex = (): MediaIndex => {
	if (globalMedia.__mediaIndex) return globalMedia.__mediaIndex;

	const rawItems = rawDataset as RawMediaItem[];
	const items = rawItems.map(toMediaItem);

	const itemsMap = new Map<string, MediaItem>();
	for (const item of items) {
		itemsMap.set(item.id, item);
	}

	const tokenIndex = buildTokenIndex(items);
	const facets = computeFacets(items);

	globalMedia.__mediaIndex = {
		items: itemsMap,
		tokenIndex,
		...facets
	};

	return globalMedia.__mediaIndex;
};

// ── QUERIES ────────────────────────────────────────────────────────

/** Get all media items as a list. */
export const getAllMediaItems = (): MediaItem[] => {
	const index = getIndex();
	return [...index.items.values()];
};

/** Get precomputed filter facets. */
export const getFacets = (): MediaFacets => {
	const index = getIndex();
	return {
		credits: index.credits,
		restrictions: index.restrictions,
		dateRange: index.dateRange
	};
};

/** Find candidate item IDs matching any of the given tokens (union), including prefix matches. */
export const findCandidateIds = (queryTokens: string[]): Set<string> => {
	const index = getIndex();

	if (queryTokens.length === 0) {
		return new Set(index.items.keys());
	}

	const candidates = new Set<string>();

	for (const token of queryTokens) {
		// Exact matches
		const exactSet = index.tokenIndex.get(token);
		if (exactSet) {
			for (const id of exactSet) candidates.add(id);
		}

		// Prefix matches (3+ chars)
		if (token.length >= 3) {
			for (const [indexedToken, ids] of index.tokenIndex) {
				if (indexedToken.startsWith(token)) {
					for (const id of ids) candidates.add(id);
				}
			}
		}
	}

	return candidates;
};

/** Get a media item by ID. */
export const getMediaItemById = (id: string): MediaItem | undefined => {
	return getIndex().items.get(id);
};

/** Check if a token exists as an exact match in the index for a given item. */
export const hasExactTokenMatch = (token: string, itemId: string): boolean => {
	const set = getIndex().tokenIndex.get(token);
	return set?.has(itemId) ?? false;
};

/** Find index tokens that matched any of the given query tokens (exact + prefix). */
export const findMatchedIndexTokens = (queryTokens: string[]): string[] => {
	const index = getIndex();
	const matched = new Set<string>();

	for (const qt of queryTokens) {
		if (index.tokenIndex.has(qt)) {
			matched.add(qt);
		}

		if (qt.length >= 3) {
			for (const indexedToken of index.tokenIndex.keys()) {
				if (indexedToken.startsWith(qt)) {
					matched.add(indexedToken);
				}
			}
		}
	}

	return [...matched];
};

/** Apply filter criteria to a media item. Returns true if the item passes all filters. */
export const matchesFilters = (item: MediaItem, filters: MediaFilterCriteria): boolean => {
	// matches even if the filter value is case-insensitive so e.g. "Morris" matches "morris"
	if (filters.credit && item.credit.toLowerCase() !== filters.credit.toLowerCase()) {
		return false;
	}

	if (filters.dateFrom && item.date < filters.dateFrom) return false;
	if (filters.dateTo && item.date > filters.dateTo) return false;

	if (filters.restrictions && filters.restrictions.length > 0) {
		const hasAll = filters.restrictions.every((r) => item.restrictions.includes(r));
		if (!hasAll) return false;
	}

	return true;
};
