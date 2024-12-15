<template>
    <svg xmlns="http://www.w3.org/2000/svg"
         x="0px"
         y="0px"
         viewBox="0 0 499.8 499.8"
         xml:space="preserve"
         @click="clickSpool">
    <desc>Converted from Adobe Illustrator SVG</desc>
  
    <path id="spool_right_rim"
          d="M202.1,0.3h-5v2.3C179,19,165,123.6,165,250s14,231.1,32.2,247.5v2.3h5
          c20.5,0,37.2-111.9,37.2-249.8S222.7,0.3,202.1,0.3z"
          :style="spoolRim" />
  
    <path id="spool_right"
          d="M197.1,0.3c20.5,0,37.2,111.9,37.2,249.8s-16.7,249.8-37.2,249.8S160,387.9,160,250
          S176.6,0.3,197.1,0.3z"
          :style="spoolColor" />
  
    <path id="spool_tube"
          d="M194.6,166.9L194.6,166.9L49.1,167l0,0c6.9,0,12.4,37.2,12.4,83.2c0,44.1-5.1,80.3-11.6,83
          l144.7,0l0,0c6.9,0,12.4-37.2,12.4-83.2C207,204.2,201.4,166.9,194.6,166.9z"
          :style="spoolTube" />
  
    <path id="filament_base"
          d="M35,31c18.8-12.1,138-10.4,162.1,0c24.9,10.4,41.1,398.9,0,438.1
          c-37.2,12.2-147.7,11.4-162.1,0C22,458.8,16.2,43,35,31z"
          :style="colorReel" />
  
    <path id="spool_left_rim"
          d="M42.5,0.3h-5v2.3C19.3,19,5.3,123.6,5.3,250s14,231.1,32.2,247.5v2.3h5
          c20.5,0,37.2-111.9,37.2-249.8S63,0.3,42.5,0.3z"
          :style="spoolRim" />
  
    <path id="spool_left"
          d="M37.5,0.3C58,0.3,74.6,112.2,74.6,250S58,499.8,37.5,499.8S0.3,387.9,0.3,250
          S16.9,0.3,37.5,0.3z"
          :style="spoolColor" />
  
    <path id="spool_hole"
          d="M35.5,171.6c6.5,0,11.6,35.1,11.6,78.4s-5.3,78.4-11.6,78.4S23.9,293.3,23.9,250
          S29,171.6,35.5,171.6z"
          :style="spoolHole" />
    </svg>
</template>


<script lang="ts">
    import Component from 'vue-class-component'
    import { Mixins, Prop } from 'vue-property-decorator'
    import BaseMixin from '@/components/mixins/base'

    @Component({})
    export default class FilamentReelIcon extends Mixins(BaseMixin) {
        @Prop({ required: false, default: '#ff0' })
        declare readonly color: string

        get colorReel() {
            return { fill: this.color }
        }

        get spoolColor() {
            return { fill: "#c08f4f" }
        }

        get spoolHole() {
            return { fill: "#231a0f" }
        }

        get spoolTube() {
            return { fill: "#594226" }
        }

        get spoolRim() {
            return { fill: "#9b7242" }
        }

        clickSpool() {
            this.$emit('click-spool')
        }
    }
</script>

<style scoped>
</style>
