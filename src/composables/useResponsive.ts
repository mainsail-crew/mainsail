import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBase } from '@/composables/useBase'
import throttle from 'lodash.throttle'

export type ResponsiveElement = {
    is: {
        [key: string]: boolean
    }
}

export function useResponsive(
    breakpoints?: { [key: string]: (el: DOMRect) => boolean }
) {
    const base = useBase()

    const targetRef = ref<HTMLElement | null>(null)

    const el = reactive<ResponsiveElement>({
        is: {},
    })

    let observer: ResizeObserver | undefined

    function onResize(entries: ResizeObserverEntry[]) {
        if (entries[0].contentRect.height === 0 && entries[0].contentRect.width === 0) {
            return
        }

        const cr = entries[0].contentRect
        const conds = breakpoints
        if (conds) {
            for (const breakpoint in conds) {
                el.is[breakpoint] = conds[breakpoint](cr)
            }
        }
    }

    onMounted(() => {
        if (breakpoints) {
            nextTick(() => {
                observer = new ResizeObserver(throttle(onResize, 50))
                if (targetRef.value) {
                    observer.observe(targetRef.value)
                }
            })
        }
    })

    onBeforeUnmount(() => {
        if (targetRef.value) {
            observer?.unobserve(targetRef.value)
        }
    })

    return {
        ...base,
        el,
        targetRef,
    }
}
