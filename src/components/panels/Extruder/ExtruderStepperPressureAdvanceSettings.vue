<template>
    <responsive :breakpoints="{ small: (el) => el.width <= 350 }">
        <template #default="{ el }">
            <v-container>
                <v-row>
                    <v-col class="pa-0">
                        <v-subheader class="_subheadline">{{ subheadline }}</v-subheader>
                    </v-col>
                </v-row>
                <pressure-advance-settings :extruder="extruderStepper" :is-small="el.is.small" />
            </v-container>
        </template>
    </responsive>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Responsive from '@/components/ui/Responsive.vue'
import { capitalize } from '@/plugins/helpers'

@Component({
    components: { Responsive },
})
export default class ExtruderStepperPressureAdvanceSettings extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly extruderStepper!: string

    get name() {
        return this.extruderStepper.substring('extruder_stepper '.length)
    }

    get subheadline() {
        if (this.motionQueue) {
            return `${capitalize(this.name)} (${this.$t('Panels.ExtruderControlPanel.PressureAdvanceSettings.SyncedWithExtruder', { extruder: this.motionQueue })})`
        }

        return capitalize(this.name)
    }

    get extruderStepperObject() {
        return this.$store.state.printer?.[this.extruderStepper] ?? undefined
    }

    get motionQueue() {
        return this.extruderStepperObject?.motion_queue ?? ''
    }
}
</script>

<style scoped>
._subheadline {
    height: auto;
}
</style>
