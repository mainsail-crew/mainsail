<style scoped>

</style>

<template>
    <div>
        <v-card class="mb-3">
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading align-baseline"><v-icon left>mdi-information</v-icon>{{ $t("Timelapse.Status")}}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text v-if="frameUrl" class="pb-0">
                <v-row>
                    <v-col>
                        <vue-load-image>
                            <img slot="image" :src="frameUrl" :alt="$t('Timelapse.Preview')" class="w-100" />
                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                            <v-icon slot="error">mdi-file</v-icon>
                        </vue-load-image>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text :class="framesCount ? 'pt-0' : ''">
                <v-row>
                    <v-col>
                        <settings-row title="Frames" v-if="framesCount > 0">
                            {{ framesCount }}
                        </settings-row>
                        <v-divider class="my-2" v-if="framesCount > 0"></v-divider>
                        <settings-row :title="$t('Timelapse.Enabled')" :dynamicSlotWidth="true">
                            <v-switch v-model="enabled" hide-details class="mt-0"></v-switch>
                        </settings-row>
                        <template v-if="enabled">
                            <v-divider class="my-2"></v-divider>
                            <settings-row :title="$t('Timelapse.Autorender')" :dynamicSlotWidth="true">
                                <v-switch v-model="autorender" hide-details class="mt-0"></v-switch>
                            </settings-row>
                        </template>

                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>
<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
@Component({
    components: {SettingsRow}
})
export default class TimelapseStatusPanel extends Mixins(BaseMixin) {

    get frameUrl() {
        const frame = this.$store.state.server.timelapse?.lastFrame?.file ?? null

        if (frame) {
            return this.apiUrl + '/server/files/timelapse_frames/' + frame
        }

        return null
    }

    get framesCount() {
        return this.$store.state.server.timelapse?.lastFrame?.count ?? 0
    }

    get enabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set enabled(newVal) {
        this.$socket.emit('machine.timelapse.post_settings', { enabled: newVal }, { action: 'server/timelapse/initSettings' })
    }

    get autorender() {
        return this.$store.state.server.timelapse?.settings?.autorender ?? false
    }

    set autorender(newVal) {
        this.$socket.emit('machine.timelapse.post_settings', { autorender: newVal }, { action: 'server/timelapse/initSettings' })
    }
}
</script>
