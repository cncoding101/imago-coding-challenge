import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/business/analytics/search';
import { AnalyticsQueryParams } from '@/schemas/analytics';

/**
 * Get search analytics
 * @description Returns aggregated analytics: total searches, average response time, and top keywords.
 * @params AnalyticsQueryParams
 * @response AnalyticsResponse
 */
export async function GET(request: NextRequest) {
	const sp = request.nextUrl.searchParams;

	const parsed = AnalyticsQueryParams.safeParse({
		topN: sp.get('topN') ?? undefined
	});

	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
	}

	const result = getAnalytics(parsed.data.topN);

	return NextResponse.json(result);
}
