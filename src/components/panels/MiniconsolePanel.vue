<template>
    <panel
        v-if="socketIsConnected && klipperState !== 'disconnected'"
        :icon="mdiConsoleLine"
        title="MDI"
        :collapsible="true"
        card-class="miniconsole-panel"
        :hide-buttons-on-collapse="true">
        <template #buttons>
            <v-btn :icon="mdiTrashCan" tile @click="clearConsole" />
            <command-help-modal :in-toolbar="true" @onCommand="commandClick($event)" />
            <v-menu
                :offset-y="true"
                :close-on-content-click="false"
                :title="$t('Panels.MiniconsolePanel.SetupConsole')">
                <template #activator="{ props }">
                    <v-btn :icon="mdiCog" tile v-bind="props" />
                </template>
                <v-list>
                    <v-list-item v-if="consoleDirection === 'shell'" class="minHeight36">
                        <v-checkbox
                            v-model="autoscroll"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.Autoscroll')" />
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox
                            v-model="hideWaitTemperatures"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTemperatures')" />
                    </v-list-item>
                    <v-list-item v-if="moonrakerComponents.includes('timelapse')" class="minHeight36">
                        <v-checkbox
                            v-model="hideTlCommands"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTimelapse')" />
                    </v-list-item>
                    <v-list-item v-for="(filter, index) in customFilters" :key="index" class="minHeight36">
                        <v-checkbox
                            v-model="filter.bool"
                            class="mt-0"
                            hide-details
                            :label="filter.name"
                            @change="toggleFilter(index, filter)" />
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox
                            v-model="rawOutput"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.RawOutput')" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <div class="d-flex flex-column">
            <v-card-text :class="consoleDirection === 'table' ? 'order-1' : 'order-2'">
                <console-textarea ref="gcodeCommandField" />
            </v-card-text>
            <v-card-text :class="(consoleDirection === 'table' ? 'order-2' : 'order-1') + ' pa-0'">
                <v-row>
                    <v-col>
                        <OverlayScrollbarsComponent
                            ref="miniConsoleScroll"
                            :style="'height: ' + consoleHeight + 'px;'"
                            :options="{}">
                            <console-table
                                ref="console"
                                :events="events"
                                :is-mini="true"
                                @command-click="commandClick" />
                            <v-divider />
                        </OverlayScrollbarsComponent>
                    </v-col>
                </v-row>
            </v-card-text>
        </div>
    </panel>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useConsole } from '@/composables/useConsole'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCog, mdiConsoleLine, mdiTrashCan } from '@mdi/js'
import CommandHelpModal from '@/components/console/CommandHelpModal.vue'
import ConsoleTextarea from '@/components/inputs/ConsoleTextarea.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const { socketIsConnected, klipperState, moonrakerComponents } = useBase()

const _console = useConsole()
const consoleDirection = _console.consoleDirection
const hideWaitTemperatures = computed({
    get: () => _console.hideWaitTemperatures.value,
    set: (val) => _console.setHideWaitTemperatures(val)
})
const hideTlCommands = computed({
    get: () => _console.hideTlCommands.value,
    set: (val) => _console.setHideTlCommands(val)
})
const customFilters = _console.customFilters
const autoscroll = computed({
    get: () => _console.autoscroll.value,
    set: (val) => _console.setAutoscroll(val)
})
const rawOutput = computed({
    get: () => _console.rawOutput.value,
    set: (val) => _console.setRawOutput(val)
})
const { toggleFilter, clearConsole } = _console

const store = useStore()

const miniConsoleScroll = ref<OverlayScrollbarsComponent | null>(null)
const gcodeCommandField = ref<typeof ConsoleTextarea | null>(null)

const consoleHeight = computed(() =>
    store.state.gui.console.height ?? 300
)

const events = computed(() =>
    store.getters['server/getConsoleEvents'](consoleDirection.value === 'table', 250)
)

watch(events, () => {
    if (consoleDirection.value === 'shell' && autoscroll.value) {
        setTimeout(() => {
            scrollToBottom()
        }, 50)
    }
})

watch(autoscroll, (newVal: boolean) => {
    if (newVal) scrollToBottom()
})

function commandClick(msg: string): void {
    gcodeCommandField.value?.setGcode(msg)
}

onMounted(() => {
    if (consoleDirection.value === 'shell') scrollToBottom()
})

function scrollToBottom() {
    nextTick(() => {
        scrollTo(100)
    })
}

function scrollToTop() {
    nextTick(() => {
        scrollTo(0)
    })
}

function scrollTo(position: number) {
    if (!miniConsoleScroll.value) return

    const instance = miniConsoleScroll.value.osInstance()
    instance?.scroll({ y: `${position}%` })
}
</script>

<style scoped>
.consoleTable {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

html.theme--light .consoleTable {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
