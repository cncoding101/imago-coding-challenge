import { NextRequest, NextResponse } from 'next/server';
import { searchItems } from '@/business/media/search';
import { SearchQueryParams } from '@/schemas/media';

/**
 * Search media items
 * @description Search across media items with keyword matching, filters, sorting, and pagination.
 * @params SearchQueryParams
 * @response SearchResponse
 */
export async function GET(request: NextRequest) {
	const sp = request.nextUrl.searchParams;

	const parsed = SearchQueryParams.safeParse({
		query: sp.get('query'),
		credit: sp.get('credit') ?? undefined,
		dateFrom: sp.get('dateFrom') ?? undefined,
		dateTo: sp.get('dateTo') ?? undefined,
		restrictions: sp.getAll('restrictions').flatMap((r) => r.split(',')),
		sortBy: sp.get('sortBy') ?? undefined,
		page: sp.get('page') ?? undefined,
		pageSize: sp.get('pageSize') ?? undefined
	});

	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
	}

	const result = searchItems(parsed.data);

	return NextResponse.json(result);
}
