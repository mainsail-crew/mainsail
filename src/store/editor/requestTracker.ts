export type RequestType = 'download' | 'upload'

/**
 * Tracks one AbortController per request type. Starting a new request of the same type aborts the previous one.
 *
 * Kept outside of Vuex state: AbortController is not serializable and doesn't need reactivity.
 */
export class RequestTracker<T extends string = RequestType> {
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

    abortAll(): void {
        this.controllers.forEach((c) => c.abort())
        this.controllers.clear()
    }

    isActive(type?: T): boolean {
        return type !== undefined ? this.controllers.has(type) : this.controllers.size > 0
    }
}

export const editorRequests = new RequestTracker()
