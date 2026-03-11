import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { type VariantProps, tv } from 'tailwind-variants';
import { cn } from '@/utils/helpers/cn';

const variants = tv({
	base: 'rounded-sm focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 aria-invalid:border-error inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
	variants: {
		variant: {
			default: 'bg-primary text-primary-content shadow-xs hover:bg-primary/90',
			destructive:
				'bg-error text-error-content shadow-xs hover:bg-error/90 focus-visible:ring-error/20',
			outline:
				'bg-base-100 shadow-xs hover:bg-base-200 hover:text-base-content border border-base-300',
			secondary: 'bg-secondary text-secondary-content shadow-xs hover:bg-secondary/80',
			ghost: 'hover:bg-base-200 hover:text-base-content',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-9 px-4 py-2 has-[>svg]:px-3',
			sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
			lg: 'h-10 px-6 has-[>svg]:px-4',
			icon: 'size-9',
			'icon-sm': 'size-8',
			'icon-lg': 'size-10'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
});

export type ButtonVariant = VariantProps<typeof variants>['variant'];
export type ButtonSize = VariantProps<typeof variants>['size'];

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children?: ReactNode;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	href: string;
	children?: ReactNode;
};

export type Props = ButtonProps | LinkButtonProps;

const isLink = (props: Props): props is LinkButtonProps => 'href' in props && !!props.href;

export const Button = (props: Props) => {
	const { variant = 'default', size = 'default', className, children, ...rest } = props;

	if (isLink(props)) {
		const { href, ...anchorRest } = rest as LinkButtonProps;
		const disabled = (rest as ButtonProps).disabled;
		return (
			<a
				data-slot="button"
				className={cn(variants({ variant, size }), className)}
				href={href}
				aria-disabled={disabled}
				role={disabled ? 'link' : undefined}
				tabIndex={disabled ? -1 : undefined}
				{...anchorRest}
			>
				{children}
			</a>
		);
	}

	const { type = 'button', disabled, ...buttonRest } = rest as ButtonProps;
	return (
		<button
			data-slot="button"
			className={cn(variants({ variant, size }), className)}
			type={type}
			disabled={disabled}
			{...buttonRest}
		>
			{children}
		</button>
	);
};
