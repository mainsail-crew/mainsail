<template>
    <svg x="0px" y="0px"viewBox="0 0 487.04 487.04" xml:space="preserve" @click="clickSpool">
    <path :style="styleCircle" style="stroke:#6e0b30;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill-rule:nonzero;opacity:1" vector-effect="non-scaling-stroke" transform="matrix(.58757 0 0 3.94769 197.135 250.047)" d="M0-63.27c34.925 0 63.27 28.345 63.27 63.27 0 34.925-28.345 63.27-63.27 63.27-34.925 0-63.27-28.345-63.27-63.27 0-34.925 28.345-63.27 63.27-63.27z" />
    <path :style="styleCircle" style="stroke:#6e0b30;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill-rule:nonzero;opacity:1" vector-effect="non-scaling-stroke" transform="matrix(.38158 0 0 3.46232 197.135 250.047)" d="m197.17,146.24c-.11,0-.21.01-.32.03v-.03H37.18l.21,207.07h159.68s.07,0,.11,0c8.51,0,15.41-46.38,15.41-103.53s-6.9-103.53-15.41-103.53Z"/>
    <path :style="styleCircle" style="stroke:#000;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill-rule:nonzero;opacity:1" vector-effect="non-scaling-stroke" transform="matrix(2.07364 0 0 3.3577 117.295 250.047)" d="m197.17,146.24c-.11,0-.21.01-.32.03v-.03H37.18l.21,207.07h159.68s.07,0,.11,0c8.51,0,15.41-46.38,15.41-103.53s-6.9-103.53-15.41-103.53Z" />
    <g transform="matrix(.58757 0 0 3.94769 37.454 250.047)">
    <path :style="styleCircle" style="stroke:#6e0b30;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill-rule:nonzero;opacity:1;filter:url(#a)" vector-effect="non-scaling-stroke" d="M0-63.27c34.925 0 63.27 28.345 63.27 63.27 0 34.925-28.345 63.27-63.27 63.27-34.925 0-63.27-28.345-63.27-63.27 0-34.925 28.345-63.27 63.27-63.27z" />
    <path style="stroke:#6e0b30;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill-rule:nonzero;opacity:1" vector-effect="non-scaling-stroke" transform="scale(.41452)" d="M0-63.27c34.925 0 63.27 28.345 63.27 63.27 0 34.925-28.345 63.27-63.27 63.27-34.925 0-63.27-28.345-63.27-63.27 0-34.925 28.345-63.27 63.27-63.27z" />
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

        get styleFilament() {
            return { fill: this.color }
        }

        get styleCircle() {
            return { fill: '#b58950' }
        }

        clickSpool() {
            this.$emit('click-spool')
        }
    }
</script>
