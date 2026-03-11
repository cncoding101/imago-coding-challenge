import { createElement, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/utils/helpers/cn';

type Variant = 'heading' | 'subHeading' | 'label' | 'paragraph';
type Color = 'default' | 'muted' | 'inherit';

const ELEMENTS: Record<Variant, string> = {
	heading: 'h1',
	subHeading: 'h2',
	label: 'label',
	paragraph: 'p'
};

const variants = tv({
	variants: {
		variant: {
			heading: 'text-2xl font-bold',
			subHeading: 'text-xl font-bold',
			label: 'text-sm font-medium',
			paragraph: 'text-base font-normal'
		},
		color: {
			default: 'text-base-content',
			muted: 'text-base-content-muted',
			inherit: 'text-inherit'
		}
	},
	defaultVariants: {
		color: 'default'
	}
});

interface TextProps {
	variant: Variant;
	color?: Color;
	children: ReactNode;
	className?: string;
}

export const Text = ({ variant, color = 'default', children, className }: TextProps) => {
	return createElement(
		ELEMENTS[variant],
		{ className: cn(variants({ variant, color }), className) },
		children
	);
};
