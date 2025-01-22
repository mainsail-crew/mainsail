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

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiArrowExpandVertical, mdiSync } from '@mdi/js'

export interface EndstopItem {
    type: 'endstop' | 'probe'
    name: string
    value: string
}

@Component({
    components: { Panel },
})
export default class EndstopPanel extends Mixins(BaseMixin) {
    mdiArrowExpandVertical = mdiArrowExpandVertical
    mdiSync = mdiSync

    private probeNames = ['probe', 'dockable_probe']

    get items() {
        let output: EndstopItem[] = []

        const endstops = this.$store.state.printer.endstops ?? {}
        Object.keys(endstops).forEach((key) => {
            output.push({ type: 'endstop', name: key, value: endstops[key] })
        })

        // dont show probe values if there are no endstop values
        if (output.length === 0) return []

        output = output.sort((a, b) => a.name.localeCompare(b.name))

        this.probeNames.forEach((probeName) => {
            if (probeName in this.$store.state.printer && 'last_query' in this.$store.state.printer[probeName]) {
                const value = this.$store.state.printer[probeName].last_query ? 'TRIGGERED' : 'open'

                output.push({
                    type: 'probe',
                    name: probeName,
                    value,
                })
            }
        })

        return output
    }

    get existsQueryProbe() {
        const commands = this.$store.state.printer.gcode?.commands ?? null
        if (commands) {
            return 'QUERY_PROBE' in commands
        }

        // fallback for older Klipper versions
        const settings = this.$store.state.printer.configfile?.settings ?? null
        if (settings) {
            this.probeNames.forEach((probeName) => {
                if (probeName in settings) return true
            })
        }

        return false
    }

    syncEndstops() {
        this.$socket.emit(
            'printer.query_endstops.status',
            {},
            { action: 'printer/getEndstopStatus', loading: 'queryEndstops' }
        )

        if (this.existsQueryProbe) {
            this.$store.dispatch('server/addEvent', { message: 'QUERY_PROBE', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'QUERY_PROBE' })
        }
    }
}
</script>
