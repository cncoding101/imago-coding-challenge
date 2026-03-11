import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/shadcn-ui/Input';
import { cn } from '@/utils/helpers/cn';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export const SearchInput = ({ value, onChange, className }: SearchInputProps) => {
	return (
		<div className={cn('relative', className)}>
			<Icon
				variant={{ type: 'outlined', icon: 'search' }}
				size="1.25rem"
				className="text-base-content-muted absolute top-1/2 left-3 -translate-y-1/2"
			/>
			<Input
				type="search"
				placeholder="Search media items..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="pl-10"
				aria-label="Search media items"
			/>
		</div>
	);
};
