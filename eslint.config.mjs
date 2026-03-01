import eslint from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginJsonc from 'eslint-plugin-jsonc'
import globals from 'globals'

export default defineConfigWithVueTs(
    // Global ignores (replaces --ignore-path .gitignore)
    {
        ignores: [
            'node_modules/',
            'dist/',
            'dev-dist/',
            'temp/',
            'design/',
            'i18n-extract/',
            'packages/',
            'components.d.ts',
            'cypress/',
            '*.local',
            '.env',
        ],
    },

    // Core ESLint recommended rules (replaces eslint:recommended)
    eslint.configs.recommended,

    // Vue 2 recommended rules (replaces plugin:vue/recommended)
    ...pluginVue.configs['flat/vue2-recommended'],

    // TypeScript setup (replaces @vue/typescript v12)
    // base = parser setup for .ts and .vue files
    // eslintRecommended = disables core ESLint rules that conflict with TS
    vueTsConfigs.base,
    vueTsConfigs.eslintRecommended,

    // Disable no-unused-vars for TS/Vue files — core rule doesn't understand
    // TypeScript properly (false positives on type imports, declaration files).
    // Will be replaced by @typescript-eslint/no-unused-vars when enabling vueTsConfigs.recommended
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.vue'],
        rules: {
            'no-unused-vars': 'off',
        },
    },

    // Global language options (replaces env + globals)
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },
            sourceType: 'module',
        },
    },

    // Vue custom rules (replaces rules section)
    {
        files: ['**/*.vue'],
        rules: {
            'vue/no-v-html': 'off',
            'vue/block-order': 'off',
            'vue/no-v-text-v-html-on-component': 'off',
            'vue/valid-v-slot': ['error', { allowModifiers: true }],
        },
    },

    // JSON locale files (replaces overrides section)
    ...pluginJsonc.configs['flat/base'],
    {
        files: ['src/locales/*.json'],
        rules: {
            'jsonc/no-dupe-keys': 'error',
            'jsonc/sort-keys': ['error', 'asc', { caseSensitive: false, natural: false }],
        },
    },

    // Prettier must be last (disables conflicting rules)
    eslintConfigPrettier
)
