import { Text } from '@/components/atoms/Text';
import { Input } from '@/components/shadcn-ui/Input';

interface DatePickerProps {
	label: string;
	value?: string;
	min?: string;
	max?: string;
	onChange: (value: string | undefined) => void;
	ariaLabel: string;
}

export function DatePicker({ label, value, min, max, onChange, ariaLabel }: DatePickerProps) {
	return (
		<>
			<Text variant="label" color="muted">
				{label}
			</Text>
			<Input
				type="date"
				value={value ?? ''}
				className="border"
				min={min}
				max={max}
				onChange={(e) => onChange(e.target.value || undefined)}
				aria-label={ariaLabel}
			/>
		</>
	);
}
