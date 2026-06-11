<template>
    <panel
        :title="$t('Machine.EndstopPanel.Endstops')"
        :icon="mdiArrowExpandVertical"
        card-class="machine-endstop-panel"
        :collapsible="true">
        <v-card-text class="pb-0 pt-6">
            <EndstopPanelItem v-for="item in items" :key="item.name" :item="item" />
            <v-row v-if="items.length === 0">
                <v-col class="pt-0">
                    <p class="mb-0">{{ $t('Machine.EndstopPanel.EndstopInfo') }}</p>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions class="pt-3">
            <v-spacer />
            <v-btn icon :loading="loadings.includes('queryEndstops')" @click="syncEndstops">
                <v-icon>{{ mdiSync }}</v-icon>
            </v-btn>
        </v-card-actions>
    </panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { mdiArrowExpandVertical, mdiSync } from '@mdi/js'
import type { EndstopItem } from '@/store/printer/types'

const { loadings } = useBase()
const store = useStore()
const socket = useSocket()

const items = computed(() => {
    let output: EndstopItem[] = []
    const endstops = store.state.printer.endstops ?? {}
    Object.keys(endstops).forEach((key) => {
        output.push({ type: 'endstop', name: key, value: endstops[key] })
    })
    if (output.length === 0) return []
    output = output.sort((a, b) => a.name.localeCompare(b.name))
    if ('probe' in store.state.printer && 'last_query' in store.state.printer.probe) {
        const value = store.state.printer.probe.last_query ? 'TRIGGERED' : 'open'
        output.push({
            type: 'probe',
            name: store.state.printer.probe.name ?? 'probe',
            value,
        })
    }
    return output
})

const existsQueryProbe = computed(() => {
    const commands = store.state.printer.gcode?.commands ?? null
    if (commands) return 'QUERY_PROBE' in commands
    return 'probe' in store.state.printer
})

function syncEndstops() {
    socket.emit(
        'printer.query_endstops.status',
        {},
        { action: 'printer/getEndstopStatus', loading: 'queryEndstops' }
    )
    if (existsQueryProbe.value) {
        store.dispatch('server/addEvent', { message: 'QUERY_PROBE', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'QUERY_PROBE' })
    }
}
</script>
