import { NextResponse } from 'next/server';
import { getFacets } from '@/business/media/facets';

/**
 * Get filter facets
 * @description Returns available filter options (credits, restrictions, date range) for the search UI.
 * @response FacetsResponse
 */
export async function GET() {
	const facets = getFacets();
	return NextResponse.json(facets);
}
