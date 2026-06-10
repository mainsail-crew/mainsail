import type { Directive } from 'vue'

export type LongpressEvent = Partial<Touch> & { preventDefault: () => void }

type LongpressBinding = ((...args: unknown[]) => void) | { handler: (...args: unknown[]) => void; args: unknown[] }

function resolveHandler(value: LongpressBinding): (e: LongpressEvent) => void {
    if (typeof value === 'function') return value
    return (e: LongpressEvent) => value.handler(e, ...value.args)
}

const cleanupMap = new WeakMap<HTMLElement, () => void>()

export const vLongpress: Directive<HTMLElement, LongpressBinding> = {
    mounted(el, binding) {
        if (typeof binding.value !== 'function' && typeof binding.value?.handler !== 'function') {
            console.warn(`[longpress:] provided expression '${binding.value}' is not a function or { handler, args } object`)
        }

        const debounceTime = Number(binding.arg ?? 1000)

        const handler = (e: Partial<Touch> & { preventDefault: TouchEvent['preventDefault'] }) => {
            resolveHandler(binding.value)(e)
        }

        let pressTimer: number | null = null
        let startX = 0
        let startY = 0
        const moveThreshold = 10

        const start = (e: TouchEvent) => {
            if (e.type === 'click') return
            if (!e.touches || e.touches.length < 1) return

            startX = e.touches[0].clientX
            startY = e.touches[0].clientY

            document
                .querySelector('body')
                ?.setAttribute('style', 'user-select: none; -webkit-user-select: none; -moz-user-select: none;')

            setTimeout(() => {
                document.querySelector('body')?.setAttribute('style', '')
            }, debounceTime + 200)

            if (pressTimer === null) {
                pressTimer = window.setTimeout(() => {
                    handler({
                        clientX: e.touches[0].clientX,
                        clientY: e.touches[0].clientY,
                        force: e.touches[0].force,
                        identifier: e.touches[0].identifier,
                        pageX: e.touches[0].pageX,
                        pageY: e.touches[0].pageY,
                        radiusX: e.touches[0].radiusX,
                        radiusY: e.touches[0].radiusY,
                        rotationAngle: e.touches[0].rotationAngle,
                        screenX: e.touches[0].screenX,
                        screenY: e.touches[0].screenY,
                        preventDefault: () => e.preventDefault(),
                    })
                }, debounceTime)
            }
            return false
        }

        const cancelOnMove = (e: TouchEvent) => {
            if (pressTimer !== null && e.touches?.length) {
                const dx = Math.abs(e.touches[0].clientX - startX)
                const dy = Math.abs(e.touches[0].clientY - startY)
                if (dx < moveThreshold && dy < moveThreshold) return
            }
            cancel()
        }

        const cancel = () => {
            if (pressTimer !== null) {
                clearTimeout(pressTimer)
                pressTimer = null
            }
        }

        const preventDragDuringLongpress = (e: Event) => {
            if (pressTimer !== null) e.preventDefault()
        }

        el.addEventListener('touchstart', start)
        el.addEventListener('touchmove', cancelOnMove, { passive: true })
        el.addEventListener('touchend', cancel)
        el.addEventListener('touchcancel', cancel)
        el.addEventListener('dragstart', preventDragDuringLongpress)
        document.addEventListener('scroll', cancel, { passive: true })

        cleanupMap.set(el, () => {
            el.removeEventListener('touchstart', start)
            el.removeEventListener('touchmove', cancelOnMove)
            el.removeEventListener('touchend', cancel)
            el.removeEventListener('touchcancel', cancel)
            el.removeEventListener('dragstart', preventDragDuringLongpress)
            document.removeEventListener('scroll', cancel)
        })
    },
    unmounted(el) {
        cleanupMap.get(el)?.()
        cleanupMap.delete(el)
    },
}

export default vLongpress
