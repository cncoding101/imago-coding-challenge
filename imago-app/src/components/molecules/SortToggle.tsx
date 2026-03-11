import type { GetMediaSearchSortBy } from '@/api/generated/server.client';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';

const LABELS: Record<string, string> = {
	relevance: 'Relevance',
	date_asc: 'Date ↑',
	date_desc: 'Date ↓'
};

const CYCLE: Record<string, GetMediaSearchSortBy> = {
	relevance: 'date_desc',
	date_desc: 'date_asc',
	date_asc: 'relevance'
};

interface SortToggleProps {
	value: GetMediaSearchSortBy;
	onChange: (value: GetMediaSearchSortBy) => void;
}

export const SortToggle = ({ value, onChange }: SortToggleProps) => {
	return (
		<Button variant="outline" size="sm" onClick={() => onChange(CYCLE[value])}>
			<Text variant="label">{LABELS[value]}</Text>
		</Button>
	);
};
