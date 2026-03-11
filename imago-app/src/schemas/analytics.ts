import { z } from 'zod/v4';

const AnalyticsQueryParams = z.object({
	topN: z.coerce
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.describe('Number of top queries to return')
});

type AnalyticsQuery = z.infer<typeof AnalyticsQueryParams>;

const AnalyticsResponse = z.object({
	totalSearches: z.number().int().describe('Total number of searches performed'),
	avgResponseTimeMs: z.number().describe('Average response time in milliseconds'),
	topQueries: z
		.array(
			z.object({
				query: z.string().describe('Original search query'),
				count: z.number().int().describe('Number of times this query was searched'),
				matchedTokens: z.array(z.string()).describe('Index tokens that matched the query'),
				avgResponseTimeMs: z
					.number()
					.describe('Average response time for this query in milliseconds')
			})
		)
		.describe('Most frequently searched queries')
});

type AnalyticsResult = z.infer<typeof AnalyticsResponse>;

export type { AnalyticsQuery, AnalyticsResult };

export { AnalyticsQueryParams, AnalyticsResponse };
