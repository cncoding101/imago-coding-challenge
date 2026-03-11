import type { SearchResponse } from '@/api/generated/server.client';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Text } from '@/components/atoms/Text';
import { MediaCard } from '@/components/organisms/MediaCard';

interface SearchResultsProps {
	data: SearchResponse | undefined;
	isLoading: boolean;
	query: string;
}

export const SearchResults = ({ data, isLoading, query }: SearchResultsProps) => {
	if (isLoading) {
		return (
			<div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
				<LoadingSpinner className="size-8" />
			</div>
		);
	}

	if (!data || data.items.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 py-20">
				<Text variant="subHeading" color="muted">
					No results found
				</Text>
				<Text variant="paragraph" color="muted">
					Try adjusting your search or filters.
				</Text>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{data.items.map((item) => (
				<MediaCard key={item.id} item={item} query={query} />
			))}
		</div>
	);
};
