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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useSocket } from '@/composables/useSocket'
import Panel from '@/components/ui/Panel.vue'

import { mdiArrowCollapseDown, mdiCloseThick } from '@mdi/js'

const store = useStore()
const { t } = useI18n()
const { isMobile, loadings } = useBase()
const { homedAxes } = useControl()
const socket = useSocket()

const mdiArrowCollapseDown = mdiArrowCollapseDown
const mdiCloseThick = mdiCloseThick

const showDialog = computed(() => {
    if (!boolBedScrewsDialog.value) return false

    const is_active = store.state.printer.bed_screws?.is_active ?? false

    return is_active && homedAxes.value.includes('xyz')
})

const boolBedScrewsDialog = computed(() => store.state.gui.uiSettings.boolBedScrewsDialog ?? true)

const config = computed(() => store.state.printer.configfile?.settings?.bed_screws ?? {})

const current_screw = computed(() => store.state.printer.bed_screws?.current_screw)

const accepted_screws = computed(() => store.state.printer.bed_screws?.accepted_screws)

const loadingAbort = computed(() => loadings.value.includes('bedScrewsAbort'))

const loadingAccept = computed(() => loadings.value.includes('bedScrewsAccept'))

const loadingAdjusted = computed(() => loadings.value.includes('bedScrewsAdjusted'))

const screwNames = computed(() => {
    const configKeys = Object.keys(config.value)
    const screwNameKeys = configKeys.filter((name: string) => name.startsWith('screw') && name.endsWith('_name'))

    const output: string[] = []
    screwNameKeys?.forEach((fullName: string) => {
        const index = fullName.indexOf('_')
        const number = parseInt(fullName.slice(5, index))

        output[number - 1] = config.value[`screw${number}_name`] ?? ''
    })

    return output
})

const countScrews = computed(() => screwNames.value.length)

const currentScrewName = computed(() => screwNames.value[current_screw.value] ?? 'UNKNOWN')

const currentScrewOutput = computed(() =>
    t('BedScrews.ScrewOutput', { current: current_screw.value, max: countScrews.value })
)

const acceptedScrewOutput = computed(() =>
    t('BedScrews.ScrewOutput', { current: accepted_screws.value, max: countScrews.value })
)

function sendAbort() {
    const gcode = `ABORT`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAbort' })
}

function sendAccept() {
    const gcode = `ACCEPT`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAccept' })
}

function sendAdjusted() {
    const gcode = `ADJUSTED`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAccept' })
}
</script>

<style scoped></style>
