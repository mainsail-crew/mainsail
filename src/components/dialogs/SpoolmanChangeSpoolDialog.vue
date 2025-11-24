<template>
    <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
        <panel
            :title="setActiveSpool ? $t('Panels.SpoolmanPanel.ChangeSpool') : $t('Panels.SpoolmanPanel.SelectSpool')"
            :icon="mdiAdjust"
            card-class="spoolman-change-spool-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-title>
                <v-text-field
                    v-model="search"
                    :append-icon="mdiMagnify"
                    :label="$t('Panels.SpoolmanPanel.Search')"
                    outlined
                    dense
                    hide-details
                    style="max-width: 300px" />
                <v-spacer />
                <v-btn
                    v-if="afcLane"
                    :title="$t('Panels.SpoolmanPanel.EjectSpool')"
                    class="px-2 minwidth-0 ml-3"
                    :loading="loadings.includes('ejectSpool')"
                    @click="ejectSpool">
                    <v-icon>{{ mdiEject }}</v-icon>
                </v-btn>
                <v-btn
                    :title="$t('Panels.SpoolmanPanel.Refresh')"
                    class="px-2 minwidth-0 ml-3"
                    :loading="loadings.includes('refreshSpools')"
                    @click="refreshSpools">
                    <v-icon>{{ mdiRefresh }}</v-icon>
                </v-btn>
                <v-btn
                    :title="$t('Panels.SpoolmanPanel.OpenSpoolManager')"
                    class="px-2 minwidth-0 ml-3"
                    @click="openSpoolManager">
                    <v-icon>{{ mdiDatabase }}</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="px-0 pb-0">
                <v-data-table
                    :headers="headers"
                    :items="spools"
                    item-key="id"
                    :search="search"
                    sort-by="last_used"
                    :sort-desc="true"
                    :custom-filter="customFilter">
                    <template #no-data>
                        <div class="text-center">{{ $t('Panels.SpoolmanPanel.NoSpools') }}</div>
                    </template>
                    <template #no-results>
                        <div class="text-center">{{ $t('Panels.SpoolmanPanel.NoResults') }}</div>
                    </template>

                    <template #item="{ item }">
                        <SpoolmanChangeSpoolDialogRow
                            :key="item.id"
                            :spool="item"
                            :max_id_digits="max_spool_id_digits"
                            @set-spool="setSpool" />
                    </template>
                </v-data-table>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiAdjust, mdiDatabase, mdiMagnify, mdiRefresh, mdiEject } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanChangeSpoolDialogRow from '@/components/dialogs/SpoolmanChangeSpoolDialogRow.vue'
@Component({
    components: { SpoolmanChangeSpoolDialogRow, Panel },
})
export default class SpoolmanChangeSpoolDialog extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiCloseThick = mdiCloseThick
    mdiDatabase = mdiDatabase
    mdiEject = mdiEject
    mdiMagnify = mdiMagnify
    mdiRefresh = mdiRefresh

    @Prop({ required: true }) declare readonly showDialog: boolean
    @Prop({ required: false, default: null }) declare readonly tool?: string
    @Prop({ required: false, default: null }) declare readonly afcLane?: string
    @Prop({ required: false, default: true }) declare readonly setActiveSpool?: boolean

    search = ''

    get spools(): ServerSpoolmanStateSpool[] {
        return this.$store.state.server.spoolman.spools ?? []
    }

    get max_spool_id_digits(): number {
        const max_id = this.$store.state.server.spoolman.spools.reduce(
            (x: number, s: ServerSpoolmanStateSpool) => Math.max(x, s.id),
            0
        )

        return max_id.toString().length
    }

    get headers() {
        return [
            {
                text: ' ',
                align: 'start',
                sortable: false,
            },
            {
                text: this.$t('Panels.SpoolmanPanel.Filament'),
                align: 'start',
                value: 'filament.name',
                sortable: false,
            },
            {
                text: this.$t('Panels.SpoolmanPanel.Material'),
                align: 'center',
                value: 'filament.material',
            },
            {
                text: this.$t('Panels.SpoolmanPanel.LastUsed'),
                align: 'end',
                value: 'last_used',
            },
            {
                text: this.$t('Panels.SpoolmanPanel.Weight'),
                align: 'end',
                value: 'remaining_weight',
            },
        ]
    }

    get spoolManagerUrl() {
        return this.$store.state.server.config.config?.spoolman?.server ?? null
    }

    get existsSaveVariables() {
        const settings = this.$store.state.printer.configfile?.settings ?? {}

        return 'save_variables' in settings
    }

    openSpoolManager() {
        window.open(this.spoolManagerUrl, '_blank')
    }

    mounted() {
        this.refresh()
    }

    refresh() {
        this.$store.dispatch('server/spoolman/refreshSpools')
    }

    close() {
        this.$emit('close')
    }

    refreshSpools() {
        this.$store.dispatch('server/spoolman/refreshSpools')
    }

    customFilter(value: any, search: string, item: ServerSpoolmanStateSpool): boolean {
        if (search.trim().startsWith('web+spoolman:s-')) {
            const spoolId = parseInt(search.split('-')[1] ?? -1)
            return item.id === spoolId
        }

        const querySplits = search.toLowerCase().split(' ')
        const searchArray = [
            item.id.toString(),
            item.comment,
            item.filament.name,
            item.filament.vendor.name,
            item.filament.material,
            item.location,
        ]

        for (const query of querySplits) {
            const result = searchArray.some((q) => q?.toLowerCase().includes(query))

            if (!result) return false
        }

        return true
    }

    setSpool(spool: ServerSpoolmanStateSpool) {
        // If dialog is used for selection only, bypass setting of active spool and propogate event
        if (!this.setActiveSpool) {
            this.$emit('select-spool', spool)
            this.close()
            return
        }

        // if afcLane is set, execute SET_SPOOL_ID and close, because it's not an active printing spool change
        if (this.afcLane) {
            this.sendGcode(`SET_SPOOL_ID LANE=${this.afcLane} SPOOL_ID=${spool.id}`)
            this.close()
            return
        }

        // if tool is set, execute setMacroVariable and close, because it's not an active printing spool change
        if (this.tool) {
            this.setMacroVariable(spool)
            this.close()
            return
        }

        this.$store.dispatch('server/spoolman/setActiveSpool', spool.id)

        this.close()
    }

    setMacroVariable(spool: ServerSpoolmanStateSpool) {
        // Set spool_id for tool
        this.sendGcode(`SET_GCODE_VARIABLE MACRO=${this.tool} VARIABLE=spool_id VALUE=${spool.id}`)

        // Close dialog if save_variables is not enabled
        if (!this.existsSaveVariables) {
            this.close()
            return
        }

        // Set spool_id to save_variable
        this.sendGcode(`SAVE_VARIABLE VARIABLE=${this.tool?.toLowerCase()}__spool_id VALUE=${spool.id}`)
    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    ejectSpool() {
        this.sendGcode(`SET_SPOOL_ID LANE=${this.afcLane} SPOOL_ID=`)
        this.close()
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (newVal) this.search = ''
    }
}
</script>
