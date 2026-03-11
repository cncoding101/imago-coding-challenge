// ── In-memory analytics store ────────────────────────────────────────

interface QueryRecord {
	count: number;
	matchedTokens: string[];
	avgResponseTimeMs: number;
}

interface AnalyticsStore {
	totalSearches: number;
	responseTimes: number[];
	queryFrequency: Map<string, QueryRecord>;
}

// nextjs handle global in memory by module scope so therefore we need to use a global variable to persist the store across requests
const globalStore = globalThis as unknown as { __analyticsStore?: AnalyticsStore };

if (!globalStore.__analyticsStore) {
	globalStore.__analyticsStore = {
		totalSearches: 0,
		responseTimes: [],
		queryFrequency: new Map()
	};
}

const store: AnalyticsStore = globalStore.__analyticsStore;

const MAX_RESPONSE_TIMES = 1000;

/** Record a completed search request. */
export const recordSearch = (
	query: string,
	matchedTokens: string[],
	responseTimeMs: number
): void => {
	store.totalSearches++;

	store.responseTimes.push(responseTimeMs);
	if (store.responseTimes.length > MAX_RESPONSE_TIMES) {
		store.responseTimes.shift();
	}

	if (query) {
		const normalized = query.toLowerCase();
		const existing = store.queryFrequency.get(normalized);
		if (existing) {
			existing.avgResponseTimeMs =
				(existing.avgResponseTimeMs * existing.count + responseTimeMs) / (existing.count + 1);
			existing.count++;
		} else {
			store.queryFrequency.set(normalized, {
				count: 1,
				matchedTokens,
				avgResponseTimeMs: responseTimeMs
			});
		}
	}
};

/** Get total number of searches performed. */
export const getTotalSearches = (): number => store.totalSearches;

/** Get response time statistics from recent searches. */
export const getResponseTimes = (): number[] => store.responseTimes;

/** Get the query frequency map. */
export const getQueryFrequency = (): Map<string, QueryRecord> => store.queryFrequency;
