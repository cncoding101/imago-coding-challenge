'use client';

import { useState } from 'react';
import type { GetMediaSearchSortBy } from '@/api/generated/server.client';
import { Text } from '@/components/atoms/Text';
import { PaginationControls } from '@/components/molecules/PaginationControls';
import { SortToggle } from '@/components/molecules/SortToggle';
import { FilterPanel, type FilterValues } from '@/components/organisms/FilterPanel';
import { Navbar } from '@/components/organisms/Navbar';
import { SearchResults } from '@/components/organisms/SearchResults';
import { useDebounce } from '@/hooks/useDebounce';
import { useMediaFacets } from '@/hooks/useMediaFacets';
import { useMediaSearch } from '@/hooks/useMediaSearch';

export function HomeContent() {
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState<GetMediaSearchSortBy>('relevance');
	const [filters, setFilters] = useState<FilterValues>({
		restrictions: []
	});

	const debouncedQuery = useDebounce(query, 300);

	const resetPage = () => setPage(1);

	const handleQueryChange = (value: string) => {
		setQuery(value);
		resetPage();
	};

	const handleSortChange = (value: GetMediaSearchSortBy) => {
		setSortBy(value);
		resetPage();
	};

	const handleFilterChange = (value: FilterValues) => {
		setFilters(value);
		resetPage();
	};

	const { data: facets } = useMediaFacets();

	const { data: searchData, isLoading } = useMediaSearch({
		query: debouncedQuery,
		sortBy,
		page,
		pageSize: 20,
		credit: filters.credit,
		dateFrom: filters.dateFrom,
		dateTo: filters.dateTo,
		restrictions: filters.restrictions.length > 0 ? filters.restrictions : undefined
	});

	return (
		<div className="min-h-screen">
			<Navbar title="IMAGO" searchInput={{ value: query, onChange: handleQueryChange }} />

			<main className="mx-auto px-4 py-6">
				{searchData && (
					<div className="mb-2 flex flex-col gap-4">
						{facets && (
							<FilterPanel facets={facets} values={filters} onChange={handleFilterChange} />
						)}

						<div className="flex items-center justify-between">
							<Text variant="label" color="muted">
								{`${searchData.total} results`}
							</Text>
							<SortToggle value={sortBy} onChange={handleSortChange} />
						</div>
					</div>
				)}

				<SearchResults data={searchData} isLoading={isLoading} query={debouncedQuery} />

				{searchData && (
					<div className="mt-6 flex justify-center">
						<PaginationControls
							page={searchData.page}
							totalPages={searchData.totalPages}
							onPageChange={setPage}
						/>
					</div>
				)}
			</main>
		</div>
	);
}
