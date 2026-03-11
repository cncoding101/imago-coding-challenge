import { Icon as IconifyIcon } from '@iconify/react';
import { useMemo } from 'react';
import { unreachable } from '@/utils/helpers/unreachable';

export const ICONS = {
	outlined: {
		search: 'ic:outline-search',
		error: 'ic:outline-error'
	},
	filled: {
		search: 'ic:baseline-search',
		error: 'ic:baseline-error'
	},
	round: {
		search: 'ic:round-search',
		error: 'ic:round-error'
	},
	sharp: {
		search: 'ic:sharp-search',
		error: 'ic:sharp-error'
	},
	'two-tone': {
		search: 'ic:twotone-search',
		error: 'ic:twotone-error'
	}
} as const;

export type IconType = keyof typeof ICONS;
export type OutlinedVariant = keyof (typeof ICONS)['outlined'];
export type FilledVariant = keyof (typeof ICONS)['filled'];
export type RoundVariant = keyof (typeof ICONS)['round'];
export type SharpVariant = keyof (typeof ICONS)['sharp'];
export type TwoToneVariant = keyof (typeof ICONS)['two-tone'];

export type IconVariant =
	| { type: 'outlined'; icon: OutlinedVariant }
	| { type: 'filled'; icon: FilledVariant }
	| { type: 'round'; icon: RoundVariant }
	| { type: 'sharp'; icon: SharpVariant }
	| { type: 'two-tone'; icon: TwoToneVariant };

interface IconProps {
	variant: IconVariant;
	size?: number | string;
	color?: string;
	className?: string;
}

export const Icon = ({ variant, color, size = '1.5rem', className }: IconProps) => {
	const iconName = useMemo(() => {
		const { icon, type } = variant;

		switch (type) {
			case 'outlined':
				return ICONS.outlined[icon as OutlinedVariant];
			case 'filled':
				return ICONS.filled[icon as FilledVariant];
			case 'round':
				return ICONS.round[icon as RoundVariant];
			case 'sharp':
				return ICONS.sharp[icon as SharpVariant];
			case 'two-tone':
				return ICONS['two-tone'][icon as TwoToneVariant];
			default:
				return unreachable(type);
		}
	}, [variant]);

	return (
		<IconifyIcon icon={iconName} color={color} width={size} height={size} className={className} />
	);
};
