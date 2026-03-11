import type { MediaItemSchema } from '@/api/generated/server.client';
import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/shadcn-ui/Badge';
import { cn } from '@/utils/helpers/cn';

interface MediaCardProps {
	item: MediaItemSchema;
	query?: string;
	className?: string;
}

const highlightMatch = (text: string, query: string): React.ReactNode => {
	if (!query.trim()) return text;

	const tokens = query
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t.length >= 2);
	if (tokens.length === 0) return text;

	const pattern = new RegExp(
		`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
		'gi'
	);
	const parts = text.split(pattern);

	return parts.map((part, i) =>
		tokens.some((t) => part.toLowerCase().includes(t)) ? (
			<mark key={i} className="bg-primary/15 text-base-content rounded-sm px-0.5">
				{part}
			</mark>
		) : (
			part
		)
	);
};

const truncate = (text: string, maxLen: number = 180): string => {
	if (text.length <= maxLen) return text;
	return text.slice(0, maxLen).trimEnd() + '…';
};

export const MediaCard = ({ item, query = '', className }: MediaCardProps) => {
	return (
		<article
			className={cn(
				'bg-base-100 border-base-300 flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md',
				className
			)}
		>
			{/* Placeholder thumbnail */}
			<div className={cn('bg-base-200 flex aspect-video items-center justify-center')}>
				<span className="text-base-content-muted text-xs">
					{item.width} × {item.height}
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-2 p-3">
				<div className="flex items-start justify-between gap-2">
					<Text variant="label" className="font-mono text-xs">
						{item.imageNumber}
					</Text>
					<Text variant="label" color="muted" className="shrink-0 text-xs">
						{item.rawDate}
					</Text>
				</div>

				<Text variant="label" color="muted" className="text-xs">
					{item.credit}
				</Text>

				<p className="text-base-content-muted line-clamp-3 text-xs leading-relaxed">
					{highlightMatch(truncate(item.description), query)}
				</p>

				{item.restrictions.length > 0 && (
					<div className="mt-auto flex flex-wrap gap-1 pt-1">
						{item.restrictions.map((r) => (
							<Badge key={r} variant="secondary" className="px-1.5 py-0 text-[10px]">
								{r}
							</Badge>
						))}
					</div>
				)}
			</div>
		</article>
	);
};
