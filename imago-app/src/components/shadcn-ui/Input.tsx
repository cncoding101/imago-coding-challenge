import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';

import { cn } from '@/utils/helpers/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn('h-8 w-full rounded-lg px-2.5 py-1', className)}
			{...props}
		/>
	);
}

export { Input };
