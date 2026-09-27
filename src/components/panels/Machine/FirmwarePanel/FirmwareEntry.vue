<template>
    <div>
        <v-row class="py-2">
            <v-col class="pl-6">
                <strong>{{ mcu.name }}</strong>
                <br />
                <span>{{ subtitle }}</span>
            </v-col>
            <v-col class="col-auto pr-6 text-right" align-self="center">
                <v-chip
                    v-if="mcu.state === 'current'"
                    small
                    label
                    outlined
                    color="green"
                    :class="{ 'firmware-chip--dimmed': disabled }"
                    class="minwidth-0 px-2">
                    <v-icon small class="mr-1">{{ mdiCheck }}</v-icon>
                    {{ $t('Machine.FirmwarePanel.State.Current') }}
                </v-chip>
                <v-chip
                    v-else-if="canUpdate"
                    small
                    label
                    outlined
                    color="primary"
                    :disabled="disabled"
                    class="minwidth-0 px-2 text-uppercase"
                    @click="clickUpdate">
                    <v-icon small class="mr-1">{{ mdiProgressUpload }}</v-icon>
                    {{ $t('Machine.FirmwarePanel.Update') }}
                </v-chip>
                <v-tooltip v-else top>
                    <template #activator="{ on, attrs }">
                        <v-chip
                            small
                            label
                            outlined
                            color="grey"
                            :class="{ 'firmware-chip--dimmed': disabled }"
                            class="minwidth-0 px-2"
                            v-bind="attrs"
                            v-on="on">
                            {{ stateLabel }}
                        </v-chip>
                    </template>
                    <span>{{ mcu.message }}</span>
                </v-tooltip>
            </v-col>
        </v-row>
        <firmware-update-hint v-model="boolShowUpdateHint" :mcus="[mcu.name]" @do-update="doUpdate" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import FirmwareUpdateHint from '@/components/panels/Machine/FirmwarePanel/FirmwareUpdateHint.vue'
import { AldisMcu } from '@/store/server/firmware/types'
import { stateLabelKey, transportLabel } from '@/store/server/firmware/helpers'
import { mdiCheck, mdiProgressUpload } from '@mdi/js'

@Component({
    components: { FirmwareUpdateHint },
})
export default class FirmwarePanelEntry extends Mixins(BaseMixin) {
    mdiCheck = mdiCheck
    mdiProgressUpload = mdiProgressUpload

    boolShowUpdateHint = false

    @Prop({ type: Object, required: true }) readonly mcu!: AldisMcu
    @Prop({ type: String, default: null }) readonly targetVersion!: string | null
    @Prop({ type: Boolean, default: false }) readonly disabled!: boolean

    // Buttons follow the agent's actions, but only for states this version understands.
    get canUpdate() {
        return this.mcu.state === 'update_available' && this.mcu.actions.includes('update')
    }

    get stateLabel() {
        const key = stateLabelKey(this.mcu.state)

        return key ? this.$t(key).toString() : this.mcu.state.toUpperCase()
    }

    get subtitle() {
        const version = this.mcu.running_version ?? this.$t('Machine.FirmwarePanel.UnknownVersion').toString()
        const parts = [transportLabel(this.mcu.transport), version].filter((part) => part !== null)
        const target = this.mcu.state === 'update_available' && this.targetVersion ? ` → ${this.targetVersion}` : ''

        return parts.join(' · ') + target
    }

    get hideUpdateWarning() {
        return this.$store.state.gui.uiSettings.hideUpdateWarnings ?? false
    }

    clickUpdate() {
        if (this.hideUpdateWarning) {
            this.doUpdate()
            return
        }

        this.boolShowUpdateHint = true
    }

    doUpdate() {
        this.$store.dispatch('server/firmware/update', { mcus: [this.mcu.name] })
    }
}
</script>

<style scoped>
.firmware-chip--dimmed {
    opacity: 0.4;
}
</style>
