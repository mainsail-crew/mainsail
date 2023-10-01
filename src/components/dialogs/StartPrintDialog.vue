<template>
    <v-dialog v-model="bool" :max-width="dialogWidth">
        <v-card>
            <v-img v-if="file.big_thumbnail" contain :src="file.big_thumbnail"></v-img>
            <v-card-title class="headline">{{ $t('Dialogs.StartPrint.Headline') }}</v-card-title>
            <v-card-text class="pb-0">
                {{ $t('Dialogs.StartPrint.DoYouWantToStartFilename', { filename: file.filename }) }}
            </v-card-text>
            <template v-if="moonrakerComponents.includes('timelapse')">
                <v-divider class="mt-3 mb-2"></v-divider>
                <v-card-text class="pb-0">
                    <settings-row :title="$t('Dialogs.StartPrint.Timelapse')">
                        <v-switch v-model="timelapseEnabled" hide-details class="mt-0"></v-switch>
                    </settings-row>
                </v-card-text>
                <v-divider class="mt-2 mb-0"></v-divider>
            </template>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="" text @click="closeDialog">{{ $t('Dialogs.StartPrint.Cancel') }}</v-btn>
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

@Component({
    components: {
        SettingsRow,
    },
})
export default class StartPrintDialog extends Mixins(BaseMixin) {
    @Prop({ required: true, default: false })
    declare readonly bool: boolean

    @Prop({ required: true, default: '' })
    declare readonly currentPath: string

    @Prop({ required: true })
    declare file: FileStateGcodefile

    get timelapseEnabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set timelapseEnabled(newVal) {
        this.$socket.emit(
            'machine.timelapse.post_settings',
            { enabled: newVal },
            { action: 'server/timelapse/initSettings' },
        )
    }

    get dialogWidth() {
        return this.file.big_thumbnail_width ?? 400
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
