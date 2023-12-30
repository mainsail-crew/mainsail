<style scoped></style>

<template>
    <div v-if="['printing', 'paused'].includes(printer_state) && printing_objects.length">
        <v-container class="py-0">
            <div class="d-flex flex-row flex-nowrap justify-space-between">
                <div class="py-2" style="width: calc(100% - 25px)">
                    <span class="subtitle-2 d-block px-0 text--disabled text-truncate">
                        <v-icon class="mr-2" small>{{ mdiPrinter3dNozzle }}</v-icon>
                        {{ current_object !== null ? current_object : '--' }}
                    </span>
                </div>
                <div class="py-2 pl-0">
                    <v-icon
                        v-if="current_object !== null"
                        class="text--disabled cursor-pointer"
                        small
                        @click="openCancelObjectDialog(current_object)">
                        {{ mdiSelectionRemove }}
                    </v-icon>
                </div>
            </div>
        </v-container>
        <v-divider class="mt-0 mb-0" />
        <v-dialog v-model="boolShowExcludeObjectDialog" max-width="400">
            <v-card>
                <v-toolbar flat dense>
                    <v-toolbar-title>
                        <span class="subheading">
                            <v-icon left>{{ mdiSelectionRemove }}</v-icon>
                            {{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObjectHeadline') }}
                        </span>
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text class="mt-3">
                    {{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObjectText', { name: excludeObjectDialogName }) }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="boolShowExcludeObjectDialog = false">
                        {{ $t('Panels.StatusPanel.ExcludeObject.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text @click="cancelObject">
                        {{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObject') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <status-panel-exclude-object-dialog
            :show-dialog.sync="showDialogPass"
            :exclude-object-dialog-name.sync="excludeObjectDialogName"
            :exclude-object-dialog-bool.sync="boolShowExcludeObjectDialog"
            @update:name="updateExcludeObjectDialogName"
            @update:bool="updateExcludeObjectDialogBool" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelExcludeObjectDialog from '@/components/panels/Status/ExcludeObjectDialog.vue'
import { mdiPrinter3dNozzle, mdiSelectionRemove } from '@mdi/js'
@Component({
    components: { StatusPanelExcludeObjectDialog },
})
export default class StatusPanelExcludeObject extends Mixins(BaseMixin) {
    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiSelectionRemove = mdiSelectionRemove

    boolShowExcludeObjectDialog = false
    excludeObjectDialogName = ''

    @Prop({ required: true }) declare readonly showDialog: boolean

    get showDialogPass() {
        return this.showDialog
    }

    set showDialogPass(newVal) {
        this.$emit('update:showDialog', newVal)
    }

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    get current_object() {
        return this.$store.state.printer.exclude_object?.current_object ?? null
    }

    get excluded_objects() {
        return this.$store.state.printer.exclude_object?.excluded_objects ?? []
    }

    updateExcludeObjectDialogName(newVal: string) {
        this.excludeObjectDialogName = newVal
    }

    updateExcludeObjectDialogBool(newVal: boolean) {
        this.boolShowExcludeObjectDialog = newVal
    }

    openCancelObjectDialog(objectName: string) {
        this.excludeObjectDialogName = objectName
        this.boolShowExcludeObjectDialog = true
    }

    cancelObject() {
        this.$socket.emit('printer.gcode.script', { script: 'EXCLUDE_OBJECT NAME=' + this.excludeObjectDialogName })
        this.boolShowExcludeObjectDialog = false
    }
}
</script>
