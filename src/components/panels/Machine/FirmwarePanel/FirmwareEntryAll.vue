<template>
    <div>
        <v-row class="pt-3">
            <v-col class="text-center">
                <v-btn text color="primary" small :disabled="disabled" @click="clickUpdate">
                    <v-icon left>{{ mdiProgressUpload }}</v-icon>
                    {{ $t('Machine.FirmwarePanel.UpdateAll') }}
                </v-btn>
            </v-col>
        </v-row>
        <firmware-update-hint v-model="boolShowUpdateHint" :mcus="mcus" @do-update="doUpdate" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import FirmwareUpdateHint from '@/components/panels/Machine/FirmwarePanel/FirmwareUpdateHint.vue'
import { mdiProgressUpload } from '@mdi/js'

@Component({
    components: { FirmwareUpdateHint },
})
export default class FirmwarePanelEntryAll extends Mixins(BaseMixin) {
    mdiProgressUpload = mdiProgressUpload

    boolShowUpdateHint = false

    @Prop({ type: Array, required: true }) readonly mcus!: string[]
    @Prop({ type: Boolean, default: false }) readonly disabled!: boolean

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
        this.$store.dispatch('server/firmware/update', { mcus: [...this.mcus] })
    }
}
</script>
