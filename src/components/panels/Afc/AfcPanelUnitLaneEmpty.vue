<template>
    <div class="d-flex flex-column flex-grow-1">
        <v-row class="mt-0 flex-grow-1">
            <v-col
                class="align-content-center text-center text--disabled px-6"
                :class="{ 'pb-6': !prep, 'pt-3': !prep }">
                {{ text }}
            </v-col>
        </v-row>
        <v-row v-if="prep" class="mt-0 flex-grow-0">
            <v-col class="px-6 pb-6">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <v-btn dense small class="w-100 elevation-0" v-bind="attrs" v-on="on" @click="ejectLane">
                            <v-icon small>{{ mdiEject }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.AfcPanel.EjectFilament') }}</span>
                </v-tooltip>
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { mdiEject } from '@mdi/js'

@Component
export default class AfcPanelUnitLaneEmpty extends Mixins(BaseMixin, AfcMixin) {
    mdiEject = mdiEject

    @Prop({ type: String, required: true }) readonly name!: string

    get lane() {
        return this.getAfcLaneObject(this.name)
    }

    get prep() {
        return this.lane?.prep ?? false
    }

    get text() {
        if (this.prep) return this.$t('Panels.AfcPanel.PrepDetected')

        return this.$t('Panels.AfcPanel.Empty')
    }

    ejectLane() {
        const gcode = `LANE_UNLOAD LANE=${this.name}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
