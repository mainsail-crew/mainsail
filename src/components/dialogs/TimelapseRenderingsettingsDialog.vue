<template>
    <v-dialog :value="show" :max-width="700" :max-height="500">
        <panel
            :title="$t('Timelapse.RenderSettings')"
            :icon="mdiTextBoxSearchOutline"
            card-class="timelapse-rendersettings-dialog-panel"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="">
                <v-row>
                    <v-col class="col-4">
                        <v-select
                            v-model="variable_fps"
                            :label="$t('Timelapse.Type')"
                            :items="framerateTypeOptions"
                            outlined
                            dense
                            hide-details />
                    </v-col>
                    <v-col class="col-4">
                        <template v-if="variable_fps">
                            <v-text-field
                                v-model="variable_fps_min"
                                :label="$t('Timelapse.MinFramerate')"
                                type="number"
                                outlined
                                dense
                                hide-details
                                hide-spin-buttons />
                            <v-text-field
                                v-model="variable_fps_max"
                                :label="$t('Timelapse.MaxFramerate')"
                                type="number"
                                outlined
                                dense
                                hide-details
                                hide-spin-buttons
                                class="mt-3" />
                            <v-text-field
                                v-model="targetlength"
                                :label="$t('Timelapse.Targetlength')"
                                type="number"
                                outlined
                                dense
                                hide-details
                                hide-spin-buttons
                                class="mt-3" />
                        </template>
                        <v-text-field
                            v-else
                            v-model="output_framerate"
                            :label="$t('Timelapse.Framerate')"
                            type="number"
                            outlined
                            dense
                            hide-details
                            hide-spin-buttons />
                        <v-text-field
                            v-model="duplicatelastframe"
                            :label="$t('Timelapse.DuplicateLastframe')"
                            type="number"
                            outlined
                            dense
                            hide-details
                            hide-spin-buttons
                            class="mt-3" />
                    </v-col>
                    <v-col class="col-4">
                        <v-text-field
                            v-if="variable_fps"
                            v-model="variableTargetFps"
                            :label="$t('Timelapse.TargetFps')"
                            type="number"
                            outlined
                            dense
                            hide-details
                            readonly
                            class="mb-3" />
                        <v-text-field
                            v-model="estimatedVideoLength"
                            :label="$t('Timelapse.EstimatedLength')"
                            outlined
                            dense
                            hide-details
                            readonly />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">{{ $t('Timelapse.Cancel') }}</v-btn>
                <v-btn text color="primary" @click="startRender">{{ $t('Timelapse.StartRender') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import BaseMixin from '@/components/mixins/base'
import TimelapseMixin from '@/components/mixins/timelapse'
import { mdiCloseThick, mdiTextBoxSearchOutline } from '@mdi/js'

@Component({
    components: { Panel, SettingsRow },
})
export default class TimelapseRenderingsettingsDialog extends Mixins(BaseMixin, TimelapseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiTextBoxSearchOutline = mdiTextBoxSearchOutline

    @Prop({ type: Boolean, default: false }) show!: boolean

    get framerateTypeOptions() {
        return [
            { value: false, text: this.$t('Timelapse.Fixed') },
            { value: true, text: this.$t('Timelapse.Variable') },
        ]
    }

    startRender() {
        this.$socket.emit('machine.timelapse.render', {})
        this.close()
    }

    close() {
        this.$emit('close')
    }
}
</script>
