import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)


function loadLocaleMessages() {
    const locales = import.meta.globEager('../locales/*.json')
    const messages: any = {}

    for(const file in locales){
        const matched = file.match(/([A-Za-z0-9-_]+)\./i)

        if (matched && matched.length > 1) {
            const locale = matched[1]
            messages[locale] = locales[file]
        }
    }

    return messages
}

export default new VueI18n({
    locale: (import.meta.env.VUE_APP_I18N_LOCALE as string) || 'en',
    fallbackLocale: (import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE as string) || 'en',
    messages: loadLocaleMessages()
})