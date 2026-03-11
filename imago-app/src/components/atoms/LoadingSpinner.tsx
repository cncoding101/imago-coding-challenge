import { Loader } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

interface LoadingSpinnerProps {
	className?: string;
}

export const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
	return (
		<Loader role="status" aria-label="Loading" className={cn('size-4 animate-spin', className)} />
	);
};
