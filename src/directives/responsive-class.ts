import type { Directive } from 'vue'
import throttle from 'lodash.throttle'

type BreakpointMap = Record<string, (cr: DOMRectReadOnly) => boolean>

export const vResponsiveClass: Directive<HTMLElement, BreakpointMap> = {
    mounted(el, binding) {
        const handleResize = throttle((entries: ResizeObserverEntry[]) => {
            const cr = entries[0].contentRect
            for (const breakpoint in binding.value) {
                el.classList.toggle(breakpoint, binding.value[breakpoint](cr))
            }
        }, 50)

        const observer = new ResizeObserver(handleResize)
        observer.observe(el)

        cleanupMap.set(el, () => observer.disconnect())
    },
    unmounted(el) {
        cleanupMap.get(el)?.()
        cleanupMap.delete(el)
    },
}

const cleanupMap = new WeakMap<HTMLElement, () => void>()

export default vResponsiveClass
