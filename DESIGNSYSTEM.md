# Design System

All tokens are defined in [`imago-app/src/app/theme.css`](./imago-app/src/app/theme.css).

## Rules

1. All colors, spacing, and radius **must** come from design tokens — never hardcode color values.
2. Use **shadcn/ui** components for base UI primitives (Input, Select, Badge, Popover, etc.).
3. Custom components use our token names: `bg-base-100`, `text-base-content`, `border-base-300`, etc.
4. shadcn/ui components use their own token aliases (`bg-primary`, `text-foreground`, `border-border`) which are mapped to our values in `theme.css`.
5. When creating new components, check if existing atoms/molecules can be reused before adding new ones.
6. Follow Atomic Design: `atoms` → `molecules` → `organisms` → `pages`.
