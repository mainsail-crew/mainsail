<template>
    <v-card ref="filesGcodeCard" class="filesGcodeCard" flat>
        <v-data-table
            :items="gcodeFiles"
            hide-default-footer
            class="dashboard-gcodes-table"
            sort-by="time_added"
            mobile-breakpoint="0">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.EmptyGcodes') }}</div>
            </template>

            <template #item="{ item }">
                <status-panel-gcodefiles-entry :key="item.filename" :content-td-width="contentTdWidth" :item="item" />
            </template>
        </v-data-table>
        <resize-observer @notify="handleResize" />
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import StatusPanelGcodefilesEntry from '@/components/panels/Status/GcodefilesEntry.vue'
import Vue from 'vue'

@Component({
    components: { Panel, StatusPanelGcodefilesEntry },
})
export default class StatusPanelGcodefiles extends Mixins(BaseMixin, ControlMixin) {
    contentTdWidth = 100

    declare $refs: {
        filesGcodeCard: Vue
    }

    get filesLimit() {
        return this.$store.state.gui.uiSettings.dashboardFilesLimit ?? 5
    }

    get filesFilter() {
        return this.$store.state.gui.uiSettings.dashboardFilesFilter ?? []
    }

    get gcodeFiles() {
        let gcodes = this.$store.getters['files/getAllGcodes'] ?? []

        if (this.filesFilter.length > 0 && this.filesFilter.length < 3) {
            gcodes = gcodes.filter((file: FileStateGcodefile) => {
                if (this.filesFilter.includes('new') && file.last_status === null) return true
                if (this.filesFilter.includes('completed') && file.last_status === 'completed') return true
                if (
                    this.filesFilter.includes('failed') &&
                    file.last_status !== null &&
                    file.last_status !== 'completed'
                )
                    return true

                return false
            })
        }

        gcodes = gcodes
            .sort((a: FileStateGcodefile, b: FileStateGcodefile) => {
                return b.modified.getTime() - a.modified.getTime()
            })
            .slice(0, this.filesLimit)

        const requestItems = gcodes.filter(
            (file: FileStateGcodefile) => !file.metadataRequested && !file.metadataPulled
        )
        this.$store.dispatch(
            'files/requestMetadata',
            requestItems.map((file: FileStateGcodefile) => ({
                filename: 'gcodes/' + file.filename,
            }))
        )
        return gcodes
    }

    mounted() {
        setTimeout(() => {
            this.calcContentTdWidth()
        }, 200)
    }

    calcContentTdWidth() {
        this.contentTdWidth = this.$refs.filesGcodeCard.$el.clientWidth - 48 - 48 - 32
    }

    handleResize() {
        this.$nextTick(() => {
            this.calcContentTdWidth()
        })
    }
}
</script>

<style scoped>
.filesGcodeCard {
    position: relative;
}
</style>
