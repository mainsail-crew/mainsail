<template>
    <v-data-table
        v-model="selectedFiles"
        :items="files"
        class="files-table"
        :headers="filteredHeaders"
        :custom-sort="sortFiles"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page.sync="countPerPage"
        :footer-props="{
            itemsPerPageText: $t('Files.Files'),
            itemsPerPageAllText: $t('Files.AllFiles'),
            itemsPerPageOptions: [10, 25, 50, 100, -1],
        }"
        item-key="filename"
        :search="search"
        :custom-filter="advancedSearch"
        mobile-breakpoint="0"
        show-select
        @current-items="refreshMetadata">
        <template #no-data>
            <div class="text-center">{{ $t('Files.Empty') }}</div>
        </template>

        <template v-if="currentPath !== ''" #body.prepend>
            <gcodefiles-panel-table-row-back />
        </template>

        <template #item="{ index, item, isSelected, select }">
            <gcodefiles-panel-table-row-file
                v-if="!item.isDirectory"
                :key="`${index} ${item.filename}`"
                :item="item"
                :is-selected="isSelected"
                :select="select" />
            <gcodefiles-panel-table-row-directory
                v-else
                :key="`${index} ${item.filename}`"
                :item="item"
                :is-selected="isSelected"
                :select="select" />
        </template>
    </v-data-table>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { sortFiles } from '@/plugins/helpers'
import { FileStateGcodefile } from '@/store/files/types'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import GcodefilesPanelTableRowBack from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowBack.vue'
import GcodefilesPanelTableRowDirectory from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowDirectory.vue'
import GcodefilesPanelTableRowFile from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFile.vue'

@Component({
    components: {
        GcodefilesPanelTableRowBack,
        GcodefilesPanelTableRowDirectory,
        GcodefilesPanelTableRowFile,
    },
})
export default class GcodefilesPanelTable extends Mixins(BaseMixin, GcodefilesMixin) {
    sortFiles = sortFiles

    draggingFile: FileStateGcodefile | null = null

    get sortBy() {
        return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'modified'

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortDesc', value: newVal })
    }

    get countPerPage() {
        return this.$store.state.gui.view.gcodefiles.countPerPage ?? 10
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.countPerPage', value: newVal })
    }

    advancedSearch(value: any, search: string | null) {
        if (search === null) return false
        if (typeof value !== 'string') return false

        value = value.toString().toLowerCase()
        const searchSplits = search.toLowerCase().split(' ')
        for (const searchWord of searchSplits) {
            if (!value.includes(searchWord)) return false
        }

        return true
    }

    refreshMetadata(data: FileStateGcodefile[]) {
        const items = data.filter((file) => !file.isDirectory && !file.metadataRequested && !file.metadataPulled)
        this.$store.dispatch(
            'files/requestMetadata',
            items.map((file: FileStateGcodefile) => ({
                filename: 'gcodes' + this.currentPath + '/' + file.filename,
            }))
        )
    }
}
</script>

<style scoped>
.files-table ::v-deep .v-data-table-header__icon {
    margin-left: 7px;
}

.files-table ::v-deep .file-list-cursor:hover {
    cursor: pointer;
}

.files-table ::v-deep .v-data-table-header th:first-child {
    padding-right: 0;
}
</style>
