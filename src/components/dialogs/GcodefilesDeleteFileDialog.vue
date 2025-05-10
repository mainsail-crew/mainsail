<template>
    <v-dialog :value="showDialog" width="400">
        <panel :title="$t('Files.Delete')" card-class="gcodefiles-delete-file-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <p class="mb-0">
                    {{ $t('Files.DeleteSingleFileQuestion', { name: item.filename }) }}
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('Files.Cancel') }}</v-btn>
                <v-btn color="error" text @click="removeFileAction">{{ $t('Files.Delete') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'

@Component({
    components: { Panel },
})
export default class GcodefilesRenameFileDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, default: false }) showDialog!: boolean
    @Prop({ type: Object, required: true }) item!: FileStateGcodefile

    removeFileAction() {
        this.$socket.emit(
            'server.files.delete_file',
            { path: 'gcodes' + this.currentPath + '/' + this.item.filename },
            { action: 'files/getDeleteFile' }
        )

        this.closePrompt()
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>
