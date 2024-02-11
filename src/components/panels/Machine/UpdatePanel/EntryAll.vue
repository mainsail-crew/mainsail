<template>
    <div>
        <v-row class="pt-3">
            <v-col class="text-center">
                <v-btn
                    text
                    color="primary"
                    small
                    :disabled="['printing', 'paused'].includes(printer_state)"
                    @click="clickUpdate">
                    <v-icon left>{{ mdiProgressUpload }}</v-icon>
                    {{ $t('Machine.UpdatePanel.UpdateAll') }}
                </v-btn>
            </v-col>
        </v-row>
        <update-hint-all
            :bool-show-dialog="boolShowDialog"
            @close-dialog="boolShowDialog = false"
            @update-all="updateAll" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiProgressUpload } from '@mdi/js'
import UpdateHintAll from '@/components/panels/Machine/UpdatePanel/UpdateHintAll.vue'
@Component({
    components: { UpdateHintAll },
})
export default class UpdatePanelEntryAll extends Mixins(BaseMixin) {
    mdiProgressUpload = mdiProgressUpload

    boolShowDialog = false

    get hideUpdateWarning() {
        return this.$store.state.gui.uiSettings.hideUpdateWarnings ?? false
    }

    clickUpdate() {
        if (this.hideUpdateWarning) {
            this.updateAll()
            return
        }

        this.boolShowDialog = true
    }

    updateAll() {
        this.$socket.emit('machine.update.full', {})
    }
}
</script>

<style scoped></style>
