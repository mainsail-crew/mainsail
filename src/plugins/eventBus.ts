import mitt from 'mitt'

type Events = {
    'close-context-menu': void
    [key: string]: unknown
}

const emitter = mitt<Events>()

// Compat wrapper so existing Vue 2 code (EventBus.$on/$emit/$off) still works
export const EventBus = {
    $on: (event: string, callback: (...args: unknown[]) => void) => {
        emitter.on(event, callback as (payload: unknown) => void)
    },
    $emit: (event: string, ...args: unknown[]) => {
        emitter.emit(event, args[0])
    },
    $off: (event: string, callback?: (...args: unknown[]) => void) => {
        if (callback) {
            emitter.off(event, callback as (payload: unknown) => void)
        } else {
            emitter.all.delete(event)
        }
    },
}

export const CLOSE_CONTEXT_MENU = 'close-context-menu'
