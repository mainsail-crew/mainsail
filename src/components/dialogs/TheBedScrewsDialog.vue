<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="$t('BedScrews.Headline').toString()"
            :icon="mdiArrowCollapseDown"
            card-class="manual_probe-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn icon tile @click="sendAbort">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="currentScrewName"
                            :label="$t('BedScrews.ScrewName')"
                            outlined
                            dense
                            clearable
                            hide-details></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field
                            v-model="currentScrewOutput"
                            :label="$t('BedScrews.ScrewIndex')"
                            outlined
                            dense
                            clearable
                            hide-details></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field
                            v-model="acceptedScrewOutput"
                            :label="$t('BedScrews.ScrewAccepted')"
                            outlined
                            dense
                            clearable
                            hide-details></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <p class="text-center mb-0" v-html="$t('BedScrews.Description')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text :loading="loadingAbort" @click="sendAbort">
                    {{ $t('BedScrews.Abort') }}
                </v-btn>
                <v-btn color="primary" text :loading="loadingAdjusted" @click="sendAdjusted">
                    {{ $t('BedScrews.Adjusted') }}
                </v-btn>
                <v-btn color="primary" text :loading="loadingAccept" @click="sendAccept">
                    {{ $t('BedScrews.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'

import { mdiArrowCollapseDown, mdiInformation, mdiCloseThick } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'
@Component({
    components: { Panel, Responsive },
})
export default class TheBedScrewsDialog extends Mixins(BaseMixin, ControlMixin) {
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiInformation = mdiInformation
    mdiCloseThick = mdiCloseThick

    get showDialog() {
        if (!this.boolBedScrewsDialog) return false

        const is_active = this.$store.state.printer.bed_screws?.is_active ?? false

        return is_active && this.homedAxes.includes('xyz')
    }

    get boolBedScrewsDialog() {
        return this.$store.state.gui.uiSettings.boolBedScrewsDialog ?? true
    }

    get config() {
        return this.$store.state.printer.configfile?.settings?.bed_screws ?? {}
    }

    get bed_screws_state() {
        return this.$store.state.printer.bed_screws?.state
    }

    get current_screw() {
        return this.$store.state.printer.bed_screws?.current_screw
    }

    get accepted_screws() {
        return this.$store.state.printer.bed_screws?.accepted_screws
    }

    get loadingAbort() {
        return this.loadings.includes('bedScrewsAbort')
    }

    get loadingAccept() {
        return this.loadings.includes('bedScrewsAccept')
    }

    get loadingAdjusted() {
        return this.loadings.includes('bedScrewsAdjusted')
    }

    get screwNames() {
        const configKeys = Object.keys(this.config)
        const screwNameKeys = configKeys.filter((name: string) => name.startsWith('screw') && name.endsWith('_name'))

        const output: string[] = []
        screwNameKeys?.forEach((fullName: string) => {
            const index = fullName.indexOf('_')
            const number = parseInt(fullName.slice(5, index))

            output[number - 1] = this.config[`screw${number}_name`] ?? ''
        })

        return output
    }

    get countScrews() {
        return this.screwNames.length
    }

    get currentScrewName() {
        return this.screwNames[this.current_screw] ?? 'UNKNOWN'
    }

    get currentScrewOutput() {
        return this.$t('BedScrews.ScrewOutput', { current: this.current_screw, max: this.countScrews })
    }

    get acceptedScrewOutput() {
        return this.$t('BedScrews.ScrewOutput', { current: this.accepted_screws, max: this.countScrews })
    }

    sendAbort() {
        const gcode = `ABORT`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAbort' })
    }

    sendAccept() {
        const gcode = `ACCEPT`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAccept' })
    }

    sendAdjusted() {
        const gcode = `ADJUSTED`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAccept' })
    }
}
</script>

<style scoped></style>
