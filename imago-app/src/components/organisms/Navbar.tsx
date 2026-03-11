import { Text } from '@/components/atoms/Text';
import { SearchInput } from '@/components/molecules/SearchInput';

interface NavbarProps {
	title: string;
	searchInput: React.ComponentProps<typeof SearchInput>;
}

export function Navbar({ title, searchInput }: NavbarProps) {
	return (
		<header className="bg-header text-header-content sticky top-0 z-50">
			<div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
				<Text variant="heading" color="inherit" className="shrink-0 text-lg font-bold">
					{title}
				</Text>
				<SearchInput {...searchInput} className="flex-1" />
			</div>
		</header>
	);
}
