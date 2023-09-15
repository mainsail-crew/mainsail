<template>
    <div>
        <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
            <panel
                :title="$t('Panels.Spoolman.ChangeSpool')"
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
                        :label="$t('Panels.Spoolman.Search')"
                        outlined
                        dense
                        hide-details
                        style="max-width: 300px" />
                    <v-spacer />
                    <v-btn
                        :title="$t('Panels.Spoolman.Refresh')"
                        class="px-2 minwidth-0 ml-3"
                        :loading="loadings.includes('refreshSpools')"
                        @click="refreshSpools">
                        <v-icon>{{ mdiRefresh }}</v-icon>
                    </v-btn>
                    <v-btn
                        :title="$t('Panels.Spoolman.OpenSpoolManager')"
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
                        class="elevation-1"
                        :search="search"
                        :custom-filter="customFilter"
                        :disable-sort="true">
                        <template #no-data>
                            <div class="text-center">{{ $t('Panels.Spoolman.NoSpools') }}</div>
                        </template>
                        <template #no-results>
                            <div class="text-center">{{ $t('Panels.Spoolman.NoResults') }}</div>
                        </template>

                        <template #item="{ item }">
                            <SpoolmanChangeSpoolDialogRow :key="item.id" :spool="item" @set-spool="setSpool" />
                        </template>
                    </v-data-table>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiAdjust, mdiDatabase, mdiMagnify, mdiRefresh } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanChangeSpoolDialogRow from '@/components/dialogs/SpoolmanChangeSpoolDialogRow.vue'
@Component({
    components: { SpoolmanChangeSpoolDialogRow, Panel },
})
export default class SpoolmanChangeSpoolDialog extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiCloseThick = mdiCloseThick
    mdiDatabase = mdiDatabase
    mdiMagnify = mdiMagnify
    mdiRefresh = mdiRefresh

    @Prop({ required: true }) declare readonly showDialog: boolean

    search = ''

    get spools(): ServerSpoolmanStateSpool[] {
        const spools = this.$store.state.server.spoolman.spools ?? []

        return spools.filter((spool: ServerSpoolmanStateSpool) => {
            return spool.filament !== null
        })
    }

    get headers() {
        return [
            {
                text: ' ',
                align: 'start',
            },
            {
                text: this.$t('Panels.Spoolman.Filament'),
                align: 'start',
            },
            {
                text: this.$t('Panels.Spoolman.Material'),
                align: 'center',
            },
            {
                text: this.$t('Panels.Spoolman.LastUsed'),
                align: 'end',
            },
            {
                text: this.$t('Panels.Spoolman.Weight'),
                align: 'end',
            },
        ]
    }

    get spoolManagerUrl() {
        return this.$store.state.server.config.config?.spoolman?.server ?? null
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
        const querySplits = search.toLowerCase().split(' ')
        const searchArray = [
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
        this.$store.dispatch('server/spoolman/setActiveSpool', spool.id)
        this.close()
    }
}
</script>
