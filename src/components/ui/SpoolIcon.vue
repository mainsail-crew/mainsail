<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 487.04 487.04"
        xml:space="preserve"
        class="cursor-pointer"
        @click="clickSpool">
        <g>
            <circle :style="styleCircle1" cx="243.52" cy="243.52" r="232.97" />
            <circle :style="styleCircle2" cx="243.52" cy="243.52" r="112.5" />
            <path
                :style="styleCircle3"
                d="M0,243.52c0,134.42,109.1,243.52,243.52,243.52,134.42,0,243.52-109.1,243.52-243.52S377.95,0,243.52,0C109.1,0,0,109.1,0,243.52Zm115.73,181.78c-52.4-39.5-86.52-98.59-94.52-163.72v-.09c-.68-5.43,1-10.89,4.6-15,3.6-4.12,8.79-6.51,14.26-6.57l118.36-1.33c18.99-.21,36.63,9.83,46.12,26.29,9.5,16.45,9.38,36.74-.3,53.09l-60.29,101.76c-2.8,4.73-7.48,8.03-12.87,9.1-5.39,1.06-10.98-.22-15.36-3.52ZM450.22,238.8c5.49,.06,10.7,2.46,14.31,6.59,3.62,4.13,5.3,9.61,4.63,15.06-8.01,65.13-42.12,124.22-94.52,163.72l-.07,.05c-4.37,3.29-9.93,4.57-15.3,3.51-5.37-1.06-10.03-4.36-12.82-9.06l-60.33-101.84c-9.68-16.34-9.8-36.64-.3-53.09,9.5-16.45,27.13-26.5,46.12-26.29l118.27,1.33ZM338.12,40.02c5.04,2.14,8.92,6.32,10.69,11.49,1.77,5.18,1.24,10.86-1.44,15.63l-58.03,103.17c-9.31,16.56-26.83,26.8-45.83,26.8-19,0-36.51-10.25-45.83-26.8l-57.99-103.09c-2.69-4.79-3.22-10.49-1.45-15.69,1.77-5.2,5.68-9.4,10.73-11.54,60.41-25.63,128.64-25.63,189.05,0l.08,.04Z" />
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({})
export default class SpoolIcon extends Mixins(BaseMixin) {
    @Prop({ required: false, default: '#ff0' })
    declare readonly color: string

    get styleCircle1() {
        return { fill: this.color }
    }

    get styleCircle2() {
        return { fill: '#bebebe' }
    }

    get styleCircle3() {
        return { fill: '#343434' }
    }

    clickSpool() {
        this.$emit('click-spool')
    }
}
</script>
