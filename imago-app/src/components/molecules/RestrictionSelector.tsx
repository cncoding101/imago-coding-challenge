import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/shadcn-ui/Badge';

interface RestrictionSelectorProps {
	restrictions: string[];
	selected: string[];
	onToggle: (code: string) => void;
}

export function RestrictionSelector({
	restrictions,
	selected,
	onToggle
}: RestrictionSelectorProps) {
	if (restrictions.length === 0) return null;

	return (
		<>
			<Text variant="label" color="muted">
				Restrictions
			</Text>
			<div className="flex flex-wrap gap-1.5">
				{restrictions.map((r) => {
					const active = selected.includes(r);
					return (
						<Badge
							key={r}
							variant={active ? 'default' : 'outline'}
							className="cursor-pointer select-none"
							onClick={() => onToggle(r)}
							role="checkbox"
							aria-checked={active}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onToggle(r);
								}
							}}
						>
							{r}
						</Badge>
					);
				})}
			</div>
		</>
	);
}
