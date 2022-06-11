import Component from 'vue-class-component'
import BaseMixin from './base'
import { Prop } from 'vue-property-decorator'
import throttle from 'lodash.throttle'

export type ResponsiveElement = {
    is: {
        [key: string]: boolean
    }
}

@Component
export default class ResponsiveMixin extends BaseMixin {
    @Prop() protected declare breakpoints: {
        [key: string]: (el: DOMRect) => boolean
    }

    observer?: ResizeObserver

    el: ResponsiveElement = {
        is: {},
    }

    mounted() {
        if (this.breakpoints) {
            this.$nextTick(() => {
                this.observer = new ResizeObserver(throttle(this.onResize, 50))
                if (this.$el instanceof Element) {
                    this.observer.observe(this.$el)
                }
            })
        }
    }

    beforeDestroy() {
        if (this.$el instanceof Element) {
            this.observer?.unobserve(this.$el)
        }
    }

    private onResize(entries: ResizeObserverEntry[]) {
        if (entries[0].contentRect.height === 0 && entries[0].contentRect.width === 0) {
            return
        }

        const cr = entries[0].contentRect
        const conds = this.breakpoints
        for (const breakpoint in conds) {
            this.$set(this.el.is, breakpoint, conds[breakpoint](cr))
        }
    }
}
