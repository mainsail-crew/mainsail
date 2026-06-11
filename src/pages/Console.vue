<template>
    <div class="d-flex flex-column">
        <v-row :class="consoleDirection === 'table' ? 'order-0' : 'order-1 mt-3'">
            <v-col>
                <console-textarea ref="gcodeCommandField" />
            </v-col>

            <v-col class="col-auto d-flex align-center">
                <v-btn class="mr-3 px-2 minwidth-0" color="lightgray" @click="clearConsole">
                    <v-icon>{{ mdiTrashCan }}</v-icon>
                </v-btn>
                <command-help-modal @onCommand="commandClick($event)" />
                <v-menu
                    offset-y
                    :top="consoleDirection === 'shell'"
                    :close-on-content-click="false"
                    :title="$t('Console.SetupConsole')">
                    <template #activator="{ props }">
                        <v-btn class="ml-3 px-2 minwidth-0" color="lightgray" v-bind="props">
                            <v-icon>{{ mdiCog }}</v-icon>
                        </v-btn>
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
                                :label="$t('Console.HideTemperatures')" />
                        </v-list-item>
                        <v-list-item v-if="moonrakerComponents.includes('timelapse')" class="minHeight36">
                            <v-checkbox
                                v-model="hideTlCommands"
                                class="mt-0"
                                hide-details
                                :label="$t('Console.HideTimelapse')" />
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
            </v-col>
        </v-row>
        <v-row :class="consoleDirection === 'table' ? 'order-1' : 'order-0 mt-0'">
            <v-col :class="consoleDirection === 'table' ? 'col' : 'col pt-0'">
                <v-card>
                    <v-card-text class="pa-0">
                        <overlay-scrollbars ref="consoleScroll" class="consoleScrollContainer d-flex flex-column">
                            <console-table
                                ref="console"
                                :is-mini="false"
                                :events="events"
                                @command-click="commandClick" />
                        </overlay-scrollbars>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useConsole } from '@/composables/useConsole'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import CommandHelpModal from '@/components/console/CommandHelpModal.vue'
import { mdiCog, mdiTrashCan } from '@mdi/js'
import ConsoleTextarea from '@/components/inputs/ConsoleTextarea.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const store = useStore()
const { moonrakerComponents } = useBase()
const { consoleDirection, autoscroll, hideWaitTemperatures, hideTlCommands, customFilters, rawOutput, toggleFilter, clearConsole } = useConsole()

const consoleScroll = ref<any>(null)
const gcodeCommandField = ref<any>(null)

const events = computed(() => store.getters['server/getConsoleEvents'](consoleDirection.value === 'table'))

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
        if (!consoleScroll.value) return

        const overlayscroll = consoleScroll.value.osInstance()
        overlayscroll?.scroll({ y: '100%' })
    })
}
</script>

<style scoped>
.consoleScrollContainer {
    min-height: 200px;
    height: calc(var(--app-height) - 180px);
}

.gcode-command-field {
    font-family: 'Roboto Mono', monospace;
}
</style>
