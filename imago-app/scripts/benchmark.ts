/**
 * Benchmark script for search latency on 10k dataset.
 *
 * Measures:
 *   - Index build time
 *   - Search latency across various query types
 *   - Filter + search combinations
 *   - Pagination overhead
 *
 * Run with:  bun run scripts/benchmark.ts
 * For 10k:   DATASET=10k bun run scripts/benchmark.ts
 */

import { toMediaItem, type RawMediaItem } from '@/entities/media';
import {
	tokenize,
	findCandidateIds,
	findMatchedIndexTokens,
	getMediaItemById,
	hasExactTokenMatch,
	matchesFilters,
	type MediaFilterCriteria
} from '@/repositories/media';
import { searchItems } from '@/business/media/search';

// ── Helpers ──────────────────────────────────────────────────────────

const fmt = (ms: number) => `${ms.toFixed(2)}ms`;

const percentile = (sorted: number[], p: number): number => {
	const idx = Math.ceil((p / 100) * sorted.length) - 1;
	return sorted[Math.max(0, idx)];
};

const stats = (times: number[]) => {
	const sorted = [...times].sort((a, b) => a - b);
	return {
		min: sorted[0],
		max: sorted[sorted.length - 1],
		avg: times.reduce((a, b) => a + b, 0) / times.length,
		p50: percentile(sorted, 50),
		p95: percentile(sorted, 95),
		p99: percentile(sorted, 99)
	};
};

const printStats = (label: string, times: number[]) => {
	const s = stats(times);
	console.log(
		`  ${label.padEnd(35)} avg=${fmt(s.avg)}  p50=${fmt(s.p50)}  p95=${fmt(s.p95)}  p99=${fmt(s.p99)}  min=${fmt(s.min)}  max=${fmt(s.max)}`
	);
};

// ── Benchmark runner ─────────────────────────────────────────────────

const runBench = (label: string, fn: () => void, iterations = 100): number[] => {
	// Warm up
	for (let i = 0; i < 5; i++) fn();

	const times: number[] = [];
	for (let i = 0; i < iterations; i++) {
		const start = performance.now();
		fn();
		times.push(performance.now() - start);
	}
	printStats(label, times);
	return times;
};

// ── Main ─────────────────────────────────────────────────────────────

console.log('='.repeat(110));
console.log('IMAGO Search Benchmark');
console.log('='.repeat(110));

// Force index initialization and measure build time
const buildStart = performance.now();
searchItems({ query: '' }); // triggers getIndex()
const buildTime = performance.now() - buildStart;
console.log(`\nIndex build time: ${fmt(buildTime)}`);

// Count items
const allResults = searchItems({ query: '', pageSize: 1 });
console.log(`Dataset size: ${allResults.total} items\n`);

console.log('-'.repeat(110));
console.log('Search Latency (100 iterations each)');
console.log('-'.repeat(110));

// 1. Empty query (return all)
runBench('Empty query (all items)', () => {
	searchItems({ query: '' });
});

// 2. Single keyword searches
const singleKeywords = ['berlin', 'fußball', 'konzert', 'merkel', 'olympia'];
for (const kw of singleKeywords) {
	runBench(`Single keyword: "${kw}"`, () => {
		searchItems({ query: kw });
	});
}

// 3. Multi-word queries
runBench('Two keywords: "berlin politik"', () => {
	searchItems({ query: 'berlin politik' });
});

runBench('Three keywords: "sport berlin sommer"', () => {
	searchItems({ query: 'sport berlin sommer' });
});

// 4. Prefix matching
runBench('Prefix match: "ber" (3 chars)', () => {
	searchItems({ query: 'ber' });
});

runBench('Prefix match: "mün" (3 chars)', () => {
	searchItems({ query: 'mün' });
});

// 5. No results query
runBench('No results: "xyznonexistent"', () => {
	searchItems({ query: 'xyznonexistent' });
});

console.log('\n' + '-'.repeat(110));
console.log('Filter Combinations (100 iterations each)');
console.log('-'.repeat(110));

// 6. Credit filter only
runBench('Credit filter only', () => {
	searchItems({ query: '', credit: 'Sven Simon' });
});

// 7. Date range filter
runBench('Date range: 2000-2010', () => {
	searchItems({ query: '', dateFrom: '2000-01-01', dateTo: '2010-12-31' });
});

// 8. Restriction filter
runBench('Restriction filter: GER', () => {
	searchItems({ query: '', restrictions: ['GER'] });
});

// 9. Search + filters combined
runBench('Keyword + credit + date range', () => {
	searchItems({
		query: 'sport',
		credit: 'Sven Simon',
		dateFrom: '1990-01-01',
		dateTo: '2020-12-31'
	});
});

// 10. Search + sort
runBench('Keyword + sort date_desc', () => {
	searchItems({ query: 'berlin', sortBy: 'date_desc' });
});

runBench('Keyword + sort date_asc', () => {
	searchItems({ query: 'berlin', sortBy: 'date_asc' });
});

console.log('\n' + '-'.repeat(110));
console.log('Pagination (100 iterations each)');
console.log('-'.repeat(110));

runBench('Page 1, pageSize 20', () => {
	searchItems({ query: 'sport', page: 1, pageSize: 20 });
});

runBench('Page 50, pageSize 20', () => {
	searchItems({ query: 'sport', page: 50, pageSize: 20 });
});

runBench('Page 1, pageSize 100', () => {
	searchItems({ query: 'sport', page: 1, pageSize: 100 });
});

// ── Summary ──────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(110));
console.log('Summary');
console.log('='.repeat(110));
console.log(`Dataset size:     ${allResults.total} items`);
console.log(`Index build time: ${fmt(buildTime)}`);

// Run a comprehensive mix and report overall
const mixTimes: number[] = [];
const queries = [
	{ query: '' },
	{ query: 'berlin' },
	{ query: 'sport berlin' },
	{ query: 'ber' },
	{ query: 'merkel', credit: 'photothek' },
	{ query: '', dateFrom: '2000-01-01', dateTo: '2010-12-31' },
	{ query: 'konzert', sortBy: 'date_desc' as const },
	{ query: 'olympia', restrictions: ['GER'] }
];

for (let i = 0; i < 200; i++) {
	const params = queries[i % queries.length];
	const start = performance.now();
	searchItems(params);
	mixTimes.push(performance.now() - start);
}

const mixStats = stats(mixTimes);
console.log(`\nMixed workload (200 queries):`);
console.log(`  avg=${fmt(mixStats.avg)}  p50=${fmt(mixStats.p50)}  p95=${fmt(mixStats.p95)}  p99=${fmt(mixStats.p99)}`);
console.log(`\nTarget: <100ms per query → ${mixStats.p99 < 100 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log('='.repeat(110));
