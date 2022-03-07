<template>
    <div>
        <div v-if="!noHide && !init" style="visibility: hidden">
            <slot :el="el"></slot>
        </div>

        <slot :el="el"></slot>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import ResponsiveMixin from '@/components/mixins/responsive'

@Component
export default class Responsive extends Mixins(ResponsiveMixin) {
    @Prop({ default: false }) protected declare noHide: boolean

    init = false

    mounted() {
        this.init = true
    }
}
</script>
