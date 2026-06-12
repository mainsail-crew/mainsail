<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="$t('ScrewsTiltAdjust.Headline')"
            :icon="mdiArrowCollapseDown"
            card-class="manual_probe-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="clearScrewsTiltAdjust" />
            </template>
            <v-card-text v-if="error">
                <v-row>
                    <v-col>
                        <v-alert border="left" text type="error">{{ $t('ScrewsTiltAdjust.ErrorText') }}</v-alert>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text v-if="Object.keys(results).length">
                <template v-for="(result, name, index) of results" :key="`result-group-${name}`">
                    <v-divider v-if="index" class="my-1" />
                    <the-screws-tilt-adjust-dialog-entry
                        :name="name.toString()"
                        :result="result" />
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="retryScrewsTiltAdjust">
                    {{ $t('ScrewsTiltAdjust.Retry') }}
                </v-btn>
                <v-btn color="primary" variant="text" @click="clearScrewsTiltAdjust">
                    {{ $t('ScrewsTiltAdjust.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import Panel from '@/components/ui/Panel.vue'
import { mdiArrowCollapseDown, mdiCloseThick } from '@mdi/js'
import TheScrewsTiltAdjustDialogEntry from '@/components/dialogs/TheScrewsTiltAdjustDialogEntry.vue'
import type { ServerStateEvent } from '@/store/server/types'

const store = useStore()
const { isMobile } = useBase()
const { doSend } = useControl()

const error = computed(() => store.state.printer.screws_tilt_adjust?.error ?? false)

const max_deviation = computed(() => store.state.printer.screws_tilt_adjust?.max_deviation ?? null)

const results = computed(() => store.state.printer.screws_tilt_adjust?.results ?? {})

const showDialog = computed(() => {
    // don't display the dialog, if the user disabled it in the UI settings
    if (!boolScrewsTiltAdjustDialog.value) return false

    // don't display the dialog, if the user add the MAX_DEVIATION attribute to the SCREWS_TILT_CALCULATE command
    if (max_deviation.value !== null) return false

    return error.value || Object.keys(results.value).length
})

const boolScrewsTiltAdjustDialog = computed(() => store.state.gui.uiSettings.boolScrewsTiltAdjustDialog ?? true)

function clearScrewsTiltAdjust() {
    store.dispatch('printer/clearScrewsTiltAdjust')
}

async function retryScrewsTiltAdjust() {
    const entries = [...(store.state.server.events ?? [])]
    const lastCommand = entries
        .reverse()
        .find(
            (entry: ServerStateEvent) =>
                entry.type === 'command' && entry.message.startsWith('SCREWS_TILT_CALCULATE')
        )

    await store.dispatch('printer/clearScrewsTiltAdjust')

    doSend(lastCommand?.message ?? 'SCREWS_TILT_CALCULATE')
}
</script>
