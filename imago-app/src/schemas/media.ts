import { z } from 'zod/v4';

const SearchQueryParams = z.object({
	query: z.string().describe('Search query'),
	credit: z.string().optional().describe('Filter by credit/photographer'),
	dateFrom: z.string().optional().describe('Filter from date (YYYY-MM-DD)'),
	dateTo: z.string().optional().describe('Filter to date (YYYY-MM-DD)'),
	restrictions: z.array(z.string()).optional().describe('Filter by restriction country codes'),
	sortBy: z.enum(['relevance', 'date_asc', 'date_desc']).optional().describe('Sort order'),
	page: z.coerce.number().int().min(1).optional().describe('Page number'),
	pageSize: z.coerce.number().int().min(1).max(100).optional().describe('Items per page')
});

type SearchQuery = z.infer<typeof SearchQueryParams>;

const MediaItemSchema = z.object({
	id: z.string().describe('Unique identifier (bildnummer)'),
	imageNumber: z.string().describe('Image number'),
	description: z.string().describe('Normalized description text'),
	rawDescription: z.string().describe('Original suchtext'),
	credit: z.string().describe('Photographer/agency'),
	date: z.string().describe('ISO date (YYYY-MM-DD)'),
	rawDate: z.string().describe('Original date (DD.MM.YYYY)'),
	restrictions: z.array(z.string()).describe('Restriction country codes'),
	width: z.number().describe('Image width in pixels'),
	height: z.number().describe('Image height in pixels')
});

type MediaItem = z.infer<typeof MediaItemSchema>;

const SearchResponse = z.object({
	items: z.array(MediaItemSchema).describe('Matching media items'),
	page: z.number().int().describe('Current page'),
	pageSize: z.number().int().describe('Items per page'),
	total: z.number().int().describe('Total matching items'),
	totalPages: z.number().int().describe('Total pages')
});

type SearchResult = z.infer<typeof SearchResponse>;

const FacetsResponse = z.object({
	credits: z.array(z.string()).describe('Available photographer/agency names'),
	restrictions: z.array(z.string()).describe('Available restriction country codes'),
	dateRange: z
		.object({
			min: z.string().describe('Earliest date (YYYY-MM-DD)'),
			max: z.string().describe('Latest date (YYYY-MM-DD)')
		})
		.describe('Date range bounds')
});

export type { MediaItem, SearchQuery, SearchResult };

export { MediaItemSchema, SearchResponse, SearchQueryParams, FacetsResponse };
