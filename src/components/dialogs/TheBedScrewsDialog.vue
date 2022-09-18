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
                        <span>State: {{ bed_screws_state }}</span>
                        <br />
                        <span>current_screw: {{ current_screw }}</span>
                        <br />
                        <span>accepted_screws: {{ accepted_screws }}</span>
                        <br />
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
@Component({
    components: { Panel, Responsive },
})
export default class TheBedScrewsDialog extends Mixins(BaseMixin) {
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiInformation = mdiInformation
    mdiCloseThick = mdiCloseThick

    get showDialog() {
        return this.$store.state.printer.bed_screws?.is_active ?? false
    }

    get config() {
        return this.$store.state.configfile?.bed_screws ?? {}
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

<style lang="scss" scoped></style>
