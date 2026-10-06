import { spawnSync } from 'node:child_process'

// optional language arg: `npm run i18n-extract -- de` -> only ./src/locales/de.json
const lang = process.argv[2] ?? '*'

const { status } = spawnSync(
    process.execPath,
    [
        './node_modules/vue-i18n-extract/bin/vue-i18n-extract.js',
        '--vueFiles',
        './src/**/{*.?(js|ts|vue),.i18nignore}',
        '--languageFiles',
        `./src/locales/${lang}.json`,
    ],
    { stdio: 'inherit' }
)

process.exit(status ?? 1)
