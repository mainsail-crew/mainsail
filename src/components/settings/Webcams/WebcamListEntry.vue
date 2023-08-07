<template>
    <div>
        <v-divider v-if="boolBorderTop" class="my-2" />
        <settings-row :title="webcam.name" :icon="icon" :sub-title="subtitle">
            <template v-if="webcam.source === 'database'">
                <v-btn
                    class="minwidth-0 px-2"
                    small
                    outlined
                    :color="webcam.enabled ? '' : 'secondary'"
                    @click="toogleStatus">
                    <v-icon small>{{ mdiLightbulbOutline }}</v-icon>
                </v-btn>
                <v-btn class="ml-3" small outlined @click="edit">
                    <v-icon small left>{{ mdiPencil }}</v-icon>
                    {{ $t('Settings.Edit') }}
                </v-btn>
                <v-btn small outlined class="ml-3 minwidth-0 px-2" color="error" @click="deleteWebcam">
                    <v-icon small>{{ mdiDelete }}</v-icon>
                </v-btn>
            </template>
        </settings-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiDelete, mdiPencil, mdiLightbulbOutline } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'

@Component({
    components: {
        SettingsRow,
    },
})
export default class WebcamListEntry extends Mixins(BaseMixin, WebcamMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiLightbulbOutline = mdiLightbulbOutline

    @Prop({ type: Object, default: () => {} }) private webcam!: GuiWebcamStateWebcam
    @Prop({ type: Boolean, default: false }) private boolBorderTop!: boolean

    get icon() {
        return this.convertWebcamIcon(this.webcam.icon)
    }

    get subtitle() {
        if (this.webcam.service === 'mjpegstreamer-adaptive') return `URL: ${this.webcam.snapshot_url}`

        return `URL: ${this.webcam.stream_url}`
    }

    toogleStatus() {
        let webcam = { ...this.webcam }
        webcam.enabled = !webcam.enabled
        this.$store.dispatch('gui/webcams/update', { webcam: webcam, oldWebcamName: webcam.name })
    }

    edit() {
        this.$emit('edit-webcam', this.webcam)
    }

    deleteWebcam() {
        this.$store.dispatch('gui/webcams/delete', this.webcam.name)
    }
}
</script>

<style lang="scss" scoped></style>
