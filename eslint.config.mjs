import eslint from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginJsonc from 'eslint-plugin-jsonc'
import globals from 'globals'

export default defineConfigWithVueTs(
    {
        ignores: ['dist/', 'dev-dist/', 'i18n-extract/', 'components.d.ts', 'cypress/'],
    },

    eslint.configs.recommended,
    ...pluginVue.configs['flat/vue2-recommended'],

    // TypeScript setup
    // base = parser setup for .ts and .vue files
    // eslintRecommended = disables core ESLint rules that conflict with TS
    vueTsConfigs.base,
    vueTsConfigs.eslintRecommended,
    vueTsConfigs.recommended,

    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
    },

    {
        files: ['**/*.vue'],
        rules: {
            'vue/no-v-html': 'off',
            'vue/block-order': 'off',
            'vue/no-v-text-v-html-on-component': 'off',
            'vue/valid-v-slot': ['error', { allowModifiers: true }],
        },
    },

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
