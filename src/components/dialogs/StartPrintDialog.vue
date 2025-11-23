<template>
    <v-dialog
        v-model="bool"
        :max-width="400"
        content-class="overflow-x-hidden"
        @click:outside="closeDialog"
        @keydown.esc="closeDialog">
        <v-card>
            <start-print-dialog-thumbnail :file="file" :current-path="currentPath" />
            <v-card-title class="text-h5">{{ $t('Dialogs.StartPrint.Headline') }}</v-card-title>
            <v-card-text class="pb-0">
                <p class="body-2">
                    {{ question }}
                </p>
            </v-card-text>
            <start-print-dialog-afc v-if="afcExists" :file="file" />
            <start-print-dialog-spoolman v-else-if="existsSpoolman" :file="file" />
            <start-print-dialog-timelapse v-if="existsTimelapse" />
            <v-divider v-if="showDivider" class="my-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Dialogs.StartPrint.Cancel') }}</v-btn>
                <v-btn
                    color="primary"
                    text
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrint(file.filename)">
                    {{ $t('Dialogs.StartPrint.Print') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPrinter3d } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import AfcMixin from '@/components/mixins/afc'

@Component({
    components: { SettingsRow },
})
export default class StartPrintDialog extends Mixins(BaseMixin, AfcMixin) {
    mdiPrinter3d = mdiPrinter3d

    @Prop({ required: true, default: false }) readonly bool!: boolean
    @Prop({ required: true, default: '' }) readonly currentPath!: string
    @Prop({ required: true }) readonly file!: FileStateGcodefile

    get existsSpoolman() {
        return this.moonrakerComponents.includes('spoolman')
    }

    get existsTimelapse() {
        return this.moonrakerComponents.includes('timelapse')
    }

    get showDivider() {
        return this.afcExists || this.existsSpoolman || this.existsTimelapse
    }

    get active_spool(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.active_spool ?? null
    }

    get question() {
        if (this.active_spool)
            return this.$t('Dialogs.StartPrint.DoYouWantToStartFilenameFilament', {
                filename: this.file?.filename ?? 'unknown',
            })

        return this.$t('Dialogs.StartPrint.DoYouWantToStartFilename', { filename: this.file?.filename ?? 'unknown' })
    }

    startPrint(filename = '') {
        filename = (this.currentPath + '/' + filename).substring(1)
        this.closeDialog()
        this.$socket.emit('printer.print.start', { filename: filename }, { action: 'switchToDashboard' })
    }

    closeDialog() {
        this.$emit('closeDialog')
    }
}
</script>
