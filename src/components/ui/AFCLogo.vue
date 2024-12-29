<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 1067.1 1216.2"
        xml:space="preserve">
        <path
            :class="'st0'"
            d="M530.8,1199.6L18.3,903.7V312L530.8,16.1L1043.3,312v591.8L530.8,1199.6z M47.9,886.6l482.9,278.8l482.9-278.8
            V329.1L530.8,50.3L47.9,329.1V886.6z" />
        <polygon
            :class="'st1'"
            points="530.8,97.8 89,352.8 89,862.9 191.9,922.3 191.9,412.2 530.8,216.6 869.6,412.2 869.6,922.3 
            972.5,862.9 972.5,352.8 " />
        <polygon
            :class="'st1'"
            points="725.6,376.6 530.8,489.1 335.9,376.6 233,436 479.3,578.2 479.3,969.5 479.3,1088.3 530.8,1117.9 
            582.2,1088.3 582.2,969.5 582.2,578.2 828.5,436 " />
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { defaultLogoColor } from '@/store/variables'

@Component
export default class AFCLogo extends Mixins(BaseMixin) {
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
