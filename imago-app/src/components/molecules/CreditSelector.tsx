import { Text } from '@/components/atoms/Text';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/shadcn-ui/Select';

interface CreditSelectorProps {
	credits: string[];
	value: string | null;
	onChange: (value: string | null) => void;
}

export function CreditSelector({ credits, value, onChange }: CreditSelectorProps) {
	return (
		<>
			<Text variant="label" color="muted">
				Credit
			</Text>
			<Select
				value={value ?? '__all__'}
				onValueChange={(v) => onChange(v === '__all__' ? null : v)}
			>
				<SelectTrigger aria-label="Filter by credit">
					<SelectValue placeholder="All credits" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__all__">All credits</SelectItem>
					{credits.map((c) => (
						<SelectItem key={c} value={c}>
							{c}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}
