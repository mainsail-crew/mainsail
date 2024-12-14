<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 487.04 487.04"
        xml:space="preserve"
        @click="clickSpool">
    >
        <desc>Created with Fabric.js 5.3.0</desc>
        <path
            id="path1"
            stroke-linecap="round"
            d="M 0 -63.26949 C 34.92476 -63.26949 63.26949 -34.92476 63.26949 0 C 63.26949 34.92476 34.92476 63.26949 0 63.26949 C -34.92476 63.26949 -63.26949 34.92476 -63.26949 0 C -63.26949 -34.92476 -34.92476 -63.26949 0 -63.26949 z"
            transform="matrix(0.58757483,0,0,3.9476902,197.13549,250.04675)"
            :style="secondaryColor"
        />
        <path
            id="path2"
            stroke-linecap="round"
            d="M 0 -63.26949 C 34.92476 -63.26949 63.26949 -34.92476 63.26949 0 C 63.26949 34.92476 34.92476 63.26949 0 63.26949 C -34.92476 63.26949 -63.26949 34.92476 -63.26949 0 C -63.26949 -34.92476 -34.92476 -63.26949 0 -63.26949 z"
            transform="matrix(0.38157612,0,0,3.4623174,197.13549,250.04674)"
            :style="secondaryColor"
        />
        <path
            id="path3"
            stroke-linecap="round"
            d="M -38.50267 -65.24064 L 38.502680000000005 -65.24064 L 38.502680000000005 65.24064 L -38.50267 65.24064 z"
            transform="matrix(2.073642,0,0,3.3577086,117.29471,250.04674)"
            :style="colorReel"
        />
        <g
            id="OvgM38-6CZm9R47a1TDIX"
            transform="matrix(0.58757483,0,0,3.9476902,37.453957,250.04674)"
        >
            <filter id="SVGID_1" width="1.272" height="1.114" x="-.057" y="-.057">
                <feGaussianBlur id="feGaussianBlur3" in="SourceAlpha" stdDeviation="3" />
                <feOffset id="feOffset3" dx="20" dy="0" result="oBlur" />
                <feFlood id="feFlood3" flood-color="#000" flood-opacity="0.67" />
                <feComposite id="feComposite3" in2="oBlur" operator="in" />
                <feMerge id="feMerge4">
                    <feMergeNode id="feMergeNode3" />
                    <feMergeNode id="feMergeNode4" in="SourceGraphic" />
                </feMerge>
            </filter>
            <path
                id="path4"
                stroke-linecap="round"
                d="M 0 -63.26949 C 34.92476 -63.26949 63.26949 -34.92476 63.26949 0 C 63.26949 34.92476 34.92476 63.26949 0 63.26949 C -34.92476 63.26949 -63.26949 34.92476 -63.26949 0 C -63.26949 -34.92476 -34.92476 -63.26949 0 -63.26949 z"
                transform="translate(8.4959392e-7)"
                :style="secondaryColor"
            />
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({})
export default class FilamentReelIcon extends Mixins(BaseMixin){
    @Prop({ required: false, default: '#ff0'})
    declare readonly color: string

    get colorReel() {
        return { fill: this.color }
    }

    get secondaryColor() {
        return {fill:"#c08f4f"}
    }

    clickSpool() {
        this.$emit('click-spool')
    }
}
</script>

<style scoped>

</style>
