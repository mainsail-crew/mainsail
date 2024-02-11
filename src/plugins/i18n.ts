import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

import defaultLocale from '../locales/en.json'

const locale = (import.meta.env.VUE_APP_I18N_LOCALE as string) || 'en'

const i18n = new VueI18n({
    locale,
    fallbackLocale: (import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE as string) || 'en',
    messages: { en: defaultLocale },
})

export default i18n

export async function setAndLoadLocale(lang: string) {
    const locales = await import(`../locales/${lang}.json`)
    i18n.setLocaleMessage(lang, locales)
    i18n.locale = lang
    return locales
}
