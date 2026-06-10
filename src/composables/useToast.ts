import type { Plugin } from 'vue'

export const ToastPlugin: Plugin = {
    install(app) {
        // Lazy-load vue-toast-notification and install as a plugin
        (async () => {
            const mod = await import('vue-toast-notification')
            const plugin = mod.default ?? mod.ToastPlugin ?? mod
            app.use(plugin as Plugin, {
                duration: 3000,
                position: 'top-right',
            })
        })()
    },
}
