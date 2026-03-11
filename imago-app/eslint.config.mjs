import { includeIgnoreFile } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gitignorePath = path.resolve(__dirname, '.gitignore');

const eslintConfig = defineConfig([
	includeIgnoreFile(gitignorePath),
	...nextVitals,
	...nextTs,
	prettier,
	// Override default ignores of eslint-config-next.
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/api/generated/**']),
	{
		languageOptions: {
			globals: {
				// Browser and Node globals are mostly covered by Next's config,
				// but explicit here for clarity.
			}
		},
		plugins: {
			import: importPlugin,
			prettier: prettierPlugin
		},
		rules: {
			// Prettier integration
			'prettier/prettier': 'warn',

			// typescript-eslint recommends disabling no-undef for TS projects
			'no-undef': 'off',

			// Import ordering
			'import/order': [
				1,
				{
					groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
					pathGroups: [
						{ pattern: '@/components/**', group: 'internal' },
						{ pattern: '@/stores/**', group: 'internal' },
						{ pattern: '@/services/**', group: 'internal' },
						{ pattern: '@/utils/**', group: 'internal', position: 'after' },
						{ pattern: '@/**', group: 'internal' }
					],
					pathGroupsExcludedImportTypes: ['internal'],
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],

			// TypeScript naming conventions
			'@typescript-eslint/naming-convention': [
				'error',
				{
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'allow',
					selector: ['variable', 'parameter', 'method'],
					trailingUnderscore: 'forbid'
				},
				{
					filter: {
						match: false,
						regex: '^[a-zA-Z\\-]*$'
					},
					format: ['camelCase', 'UPPER_CASE', 'snake_case'],
					leadingUnderscore: 'allow',
					selector: 'property',
					trailingUnderscore: 'forbid'
				},
				{
					format: ['PascalCase', 'UPPER_CASE'],
					selector: 'typeLike'
				},
				{
					filter: {
						match: false,
						regex: '^[a-zA-Z\\-]*$'
					},
					format: ['camelCase', 'snake_case'],
					leadingUnderscore: 'allowSingleOrDouble',
					selector: 'typeProperty'
				}
			],

			'no-console': 'off',
			'no-duplicate-imports': 'off',
			'no-negated-condition': 'error',
			'no-param-reassign': [
				'error',
				{
					ignorePropertyModificationsForRegex: ['^draft', 'acc', 'req', 'request'],
					props: true
				}
			],
			// Unused modules check (off by default, enable for cleanup)
			'import/no-unused-modules': [
				'off',
				{
					ignoreExports: [],
					unusedExports: true
				}
			]
		}
	},
	// TypeScript files with type-aware rules
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				projectService: {},
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'@typescript-eslint/no-unnecessary-condition': 'warn',
			'@typescript-eslint/strict-boolean-expressions': 'off'
		}
	},
	// CommonJS files
	{
		files: ['**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off'
		}
	},
	// Config files exceptions
	{
		files: [
			'**/vitest.config*.js',
			'**/vitest.workspace.js',
			'**/vite.config.js',
			'**/vite.config.ts',
			'**/playwright.config.ts',
			'eslint.config.mjs',
			'scripts/**/*.ts',
			'postcss.config.mjs'
		],
		rules: {
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'import/no-extraneous-dependencies': 'off',
			'import/no-unresolved': 'off'
		}
	},
	// Test files
	{
		files: ['*.spec.{ts,tsx,js}', '**/*.test.{ts,tsx,js}', 'e2e/**/*.ts'],
		rules: {
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'no-restricted-globals': 'off'
		}
	}
]);

export default eslintConfig;
