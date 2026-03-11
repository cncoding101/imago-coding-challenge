import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';

interface PaginationControlsProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const PaginationControls = ({ page, totalPages, onPageChange }: PaginationControlsProps) => {
	if (totalPages <= 1) return null;

	return (
		<nav aria-label="Pagination" className="flex items-center gap-3">
			<Button
				variant="outline"
				size="sm"
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
				aria-label="Previous page"
			>
				Prev
			</Button>
			<Text variant="label" color="muted">
				{page} / {totalPages}
			</Text>
			<Button
				variant="outline"
				size="sm"
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
				aria-label="Next page"
			>
				Next
			</Button>
		</nav>
	);
};
