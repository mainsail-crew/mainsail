<template>
    <div class="gcode-list">
        <div class="gcode-list__grid">
            <gcodefiles-panel-list-card-back v-if="currentPath !== ''" />

            <gcodefiles-panel-list-card-directory
                v-for="(item, index) in directories"
                :key="`dir-${index}-${item.filename}`"
                :item="item" />

            <gcodefiles-panel-list-card-file
                v-for="(item, index) in filesOnly"
                :key="`file-${index}-${item.filename}`"
                :item="item"
                :is-selected="isItemSelected(item)"
                :select="(v) => selectItem(item, v)" />

            <div v-if="!hasContent" class="gcode-list__empty">
                <v-icon size="64" color="grey"> {{ mdiFolderOpen }} </v-icon>
                <div class="gcode-list__empty-title">{{ $t('Files.Empty') }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import GcodefilesPanelListCardBack from '@/components/panels/Gcodefiles/GcodefilesPanelListCardBack.vue'
import GcodefilesPanelListCardDirectory from '@/components/panels/Gcodefiles/GcodefilesPanelListCardDirectory.vue'
import GcodefilesPanelListCardFile from '@/components/panels/Gcodefiles/GcodefilesPanelListCardFile.vue'
import { mdiFolderOpen } from '@mdi/js'

@Component({
    components: {
        GcodefilesPanelListCardBack,
        GcodefilesPanelListCardDirectory,
        GcodefilesPanelListCardFile,
    },
})
export default class GcodefilesPanelList extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiFolderOpen = mdiFolderOpen

    get directories() {
        return this.files.filter((file) => file.isDirectory)
    }

    get filesOnly() {
        return this.files.filter((file) => !file.isDirectory)
    }

    get hasContent() {
        return this.directories.length > 0 || this.filesOnly.length > 0
    }

    isItemSelected(item: { filename: string }) {
        return this.selectedFiles.includes('gcodes' + this.currentPath + '/' + item.filename)
    }

    selectItem(item: { filename: string }, value: boolean) {
        const fullName = 'gcodes' + this.currentPath + '/' + item.filename
        const current = this.selectedFiles ?? []
        const next = value ? [...new Set([...current, fullName])] : current.filter((f) => f !== fullName)

        this.selectedFiles = next
    }
}
</script>

<style scoped>
.gcode-list {
    padding: 0 0 24px 0;
}

.gcode-list__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 0 12px;
}

@media (min-width: 1600px) {
    .gcode-list__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 700px) {
    .gcode-list__grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

.gcode-list__empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 16px;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.gcode-list__empty-title {
    font-size: 14px;
    letter-spacing: 0.02em;
}
</style>
