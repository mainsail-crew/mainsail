declare module 'lodash.debounce' {
    type DebounceSettings = {
        leading?: boolean
        maxWait?: number
        trailing?: boolean
    }

    type DebouncedFunction<T extends (...args: any[]) => any> = T & {
        cancel: () => void
        flush: () => ReturnType<T>
        pending: () => boolean
    }

    function debounce<T extends (...args: any[]) => any>(
        func: T,
        wait?: number,
        options?: DebounceSettings
    ): DebouncedFunction<T>

    export default debounce
}

declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
        immediate?: boolean
        onNeedRefresh?: () => void
        onOfflineReady?: () => void
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
        onRegisterError?: (error: unknown) => void
    }

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

declare module 'echarts/types/dist/shared.d' {
    export type Dictionary<T = unknown> = Record<string, T>
    export type ECBasicOption = Record<string, any>
    export type TopLevelFormatterParams = any
    export type TooltipPositionCallback = (...args: any[]) => any
}

declare module 'unplugin-vue-components/vite' {
    const Components: any
    export default Components
}

declare module 'unplugin-vue-components/resolvers' {
    export const Vuetify3Resolver: (...args: any[]) => any
}
