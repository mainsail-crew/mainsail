<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 599.38 523.11"
        xml:space="preserve">
        <g>
            <path
                :style="'fill:' + color + ';'"
                d="M382.29,142.98L132.98,522.82L0,522.68L344.3,0l0,0C352.18,49.06,365.2,97.68,382.29,142.98" />
            <path
                :style="'fill:' + color + ';'"
                d="M413.28,213.54L208.5,522.92l132.94,0.19l135.03-206.33l0,0C452.69,284.29,431.53,249.77,413.28,213.54 L413.28,213.54" />
            <path
                :style="'fill:' + color + ';'"
                d="M599.38,447.69l-49.25,75.42L417,522.82l101.6-153.67l0,0C543.48,397.35,570.49,423.61,599.38,447.69 L599.38,447.69z" />
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { defaultLogoColor } from '@/store/variables'

@Component
export default class MainsailLogo extends Mixins(BaseMixin) {
    private internalColor = defaultLogoColor

    @Prop({ required: false, default: '' })
    declare readonly color: string

    @Watch('color')
    colorChanged(newVal: string) {
        this.internalColor = newVal !== '' ? newVal : defaultLogoColor
    }

    created() {
        if (this.color !== '') this.internalColor = this.color
    }
}
</script>
