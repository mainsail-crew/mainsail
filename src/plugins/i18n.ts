import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

function loadLocaleMessages() {
    const locales = import.meta.globEager('../locales/*.json')
    const messages: any = {}

    for (const file in locales) {
        const langKey = file.slice(file.lastIndexOf('.') - 2, file.lastIndexOf('.'))

        if (langKey && langKey.length > 1) {
            messages[langKey] = JSON.parse(JSON.stringify(locales[file]))
        }
    }

    return messages
}

export default new VueI18n({
    locale: (import.meta.env.VUE_APP_I18N_LOCALE as string) || 'en',
    fallbackLocale: (import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE as string) || 'en',
    messages: loadLocaleMessages(),
})
