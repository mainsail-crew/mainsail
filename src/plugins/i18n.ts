import { createI18n } from 'vue-i18n'

const locale = (import.meta.env.VUE_APP_I18N_LOCALE as string) || 'en'

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: (import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE as string) || 'en',
    messages: {},
    warnHtmlInMessage: 'off',
})

export default i18n

export async function setAndLoadLocale(lang: string) {
    const locales = await import(`../locales/${lang}.json`)
    i18n.global.setLocaleMessage(lang, locales.default as Record<string, string>)
    i18n.global.locale.value = lang
    return locales
}
