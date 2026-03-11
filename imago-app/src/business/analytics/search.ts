import { getTotalSearches, getResponseTimes, getQueryFrequency } from '@/repositories/analytics';
import { AnalyticsResult } from '@/schemas/analytics';

/** Aggregate analytics data for the dashboard. */
export const getAnalytics = (topN: number = 10): AnalyticsResult => {
	const totalSearches = getTotalSearches();

	const responseTimes = getResponseTimes();
	const avgResponseTimeMs =
		responseTimes.length > 0
			? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100
			: 0;

	const frequency = getQueryFrequency();
	const topQueries = [...frequency.entries()]
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, topN)
		.map(([query, { count, matchedTokens, avgResponseTimeMs: avg }]) => ({
			query,
			count,
			matchedTokens,
			avgResponseTimeMs: Math.round(avg * 100) / 100
		}));

	return { totalSearches, avgResponseTimeMs, topQueries };
};
