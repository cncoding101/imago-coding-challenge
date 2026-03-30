import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getFacets } from '@/business/media/facets';
import { searchItems } from '@/business/media/search';
import { HomeContent } from './home-content';

const defaultSearchParams = { query: '', sortBy: 'relevance' as const, page: 1, pageSize: 20 };

export default async function Home() {
	const queryClient = new QueryClient();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ['mediaSearch', defaultSearchParams],
			queryFn: () =>
				({ data: searchItems(defaultSearchParams), status: 200, headers: new Headers() })
		}),
		queryClient.prefetchQuery({
			queryKey: ['mediaFacets'],
			queryFn: () => ({ data: getFacets(), status: 200, headers: new Headers() })
		})
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HomeContent />
		</HydrationBoundary>
	);
}
