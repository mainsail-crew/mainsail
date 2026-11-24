import type { EditorRequestType } from '@/store/editor/types'

/**
 * Tracks one AbortController per request type. Starting a new request of the same type aborts the previous one.
 *
 * Kept outside of Vuex state: AbortController is not serializable and doesn't need reactivity.
 */
export class RequestTracker<T extends string> {
    private readonly controllers = new Map<T, AbortController>()

    start(type: T): AbortController {
        this.abort(type)
        const controller = new AbortController()
        this.controllers.set(type, controller)
        return controller
    }

    isCurrent(type: T, controller: AbortController): boolean {
        return this.controllers.get(type) === controller
    }

    /** Returns true if this was the current request (and it is now finished). */
    finish(type: T, controller: AbortController): boolean {
        if (!this.isCurrent(type, controller)) return false
        this.controllers.delete(type)
        return true
    }

    abort(type: T): void {
        this.controllers.get(type)?.abort()
        this.controllers.delete(type)
    }
}

export const editorRequests = new RequestTracker<EditorRequestType>()
