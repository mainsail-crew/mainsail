import throttle from 'lodash.throttle'
import Vue from 'vue'

Vue.directive('responsive-class', {
    inserted(el, conds) {
        const handleResize = throttle((entries: ResizeObserverEntry[]) => {
            const cr = entries[0].contentRect
            for (const breakpoint in conds.value) {
                el.classList.toggle(breakpoint, conds.value[breakpoint](cr))
            }
        }, 50)

        const observer = new ResizeObserver(handleResize)
        observer.observe(el)
    },
})
