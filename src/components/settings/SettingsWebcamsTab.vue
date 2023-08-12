<template>
    <div>
        <v-card v-if="!boolForm" flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.WebcamsTab.Webcams') }}</h3>
                <webcam-list-entry
                    v-for="(webcam, index) in webcams"
                    :key="webcam.name"
                    :webcam="webcam"
                    :bool-border-top="index > 0"
                    @edit-webcam="editWebcam" />
            </v-card-text>
            <v-card-actions>
                <v-btn v-if="existCrowsnestConf" text color="primary" @click="openCrowsnestConf">
                    {{ $t('Settings.WebcamsTab.EditCrowsnestConf') }}
                </v-btn>
                <v-spacer />
                <v-btn text color="primary" @click="createWebcam">{{ $t('Settings.WebcamsTab.AddWebcam') }}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-else flat>
            <webcam-form :webcam="formWebcam" :type="typeForm" @close="closeForm" />
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import { FileStateFile } from '@/store/files/types'
import WebcamForm from '@/components/settings/Webcams/WebcamForm.vue'
import WebcamListEntry from '@/components/settings/Webcams/WebcamListEntry.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component({
    components: {
        SettingsRow,
        WebcamForm,
        WebcamListEntry,
    },
})
export default class SettingsWebcamsTab extends Mixins(BaseMixin, WebcamMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete

    private boolForm = false
    private typeForm: 'create' | 'edit' = 'create'
    private formWebcam: GuiWebcamStateWebcam = {} as GuiWebcamStateWebcam

    get webcams() {
        return this.$store.state.gui.webcams.webcams ?? []
    }

    get configfiles() {
        return this.$store.getters['files/getDirectory']('config')?.childrens ?? []
    }

    get crowsnestConf(): FileStateFile | null {
        return this.configfiles.find((file: FileStateFile) => file.filename === 'crowsnest.conf')
    }

    get existCrowsnestConf(): boolean {
        return this.configfiles.findIndex((file: FileStateFile) => file.filename === 'crowsnest.conf') !== -1
    }

    openCrowsnestConf() {
        this.$store.dispatch('editor/openFile', {
            root: 'config',
            path: '/',
            filename: this.crowsnestConf?.filename,
            size: this.crowsnestConf?.size,
            permissions: this.crowsnestConf?.permissions,
        })
    }

    createWebcam() {
        this.formWebcam = {
            name: '',
            enabled: true,
            icon: 'mdiWebcam',
            service: 'mjpegstreamer-adaptive',
            target_fps: 15,
            target_fps_idle: 15,
            stream_url: '/webcam/?action=stream',
            snapshot_url: '/webcam/?action=snapshot',
            rotation: 0,
            flip_horizontal: false,
            flip_vertical: false,
            extra_data: {},
        }

        this.typeForm = 'create'
        this.boolForm = true
    }

    closeForm() {
        this.boolForm = false
    }

    editWebcam(webcam: GuiWebcamStateWebcam) {
        this.formWebcam = { ...webcam }
        this.typeForm = 'edit'
        this.boolForm = true
    }
}
</script>
