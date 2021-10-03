<style lang="scss" scoped>
    svg {
        background: rgba(200, 200, 200);
    }
</style>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :viewBox="viewBox" xml:space="preserve">
        <g>
            <polygon
                v-for="(object, index) in printing_objects"
                v-bind:key="index"
                :points="object.polygon.map(point => point.join(',')).join(' ')"
                :title="object.name"
                style="fill: rgba(255,255,255,0.7); stroke: gray; stroke-width: 2; fill-rule: evenodd;"
            />
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class StatusPanelObjectMap extends Mixins(BaseMixin) {

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    get current_object() {
        return this.$store.state.printer.exclude_object?.current_object ?? null
    }

    get excluded_objects() {
        return this.$store.state.printer.exclude_object?.excluded_objects ?? []
    }

    get viewBox() {
        return this.stepperXmin+' '+this.stepperYmin+' '+this.stepperXmax+' '+this.stepperYmax
    }
    
    get stepperXmin() {
        return this.$store.state.printer.configfile?.settings?.stepper_x?.position_min ?? 0
    }
    
    get stepperXmax() {
        return this.$store.state.printer.configfile?.settings?.stepper_x?.position_max ?? 0
    }
    
    get stepperYmin() {
        return this.$store.state.printer.configfile?.settings?.stepper_y?.position_min ?? 200
    }
    
    get stepperYmax() {
        return this.$store.state.printer.configfile?.settings?.stepper_y?.position_max ?? 200
    }
}
</script>