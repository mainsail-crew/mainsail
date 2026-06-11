<template>
    <panel :title="$t('Files.GCodeFiles')" :icon="mdiFileDocumentMultipleOutline" card-class="gcode-files-panel">
        <v-card-text>
            <gcodefiles-panel-header />
            <gcodefiles-panel-header-path-size />
        </v-card-text>
        <v-divider class="mb-3" />
        <gcodefiles-panel-list />
    </panel>
</template>

<script setup lang="ts">
import Panel from '@/components/ui/Panel.vue'
import GcodefilesPanelHeader from '@/components/panels/Gcodefiles/GcodefilesPanelHeader.vue'
import GcodefilesPanelHeaderPathSize from '@/components/panels/Gcodefiles/GcodefilesPanelHeaderPathSize.vue'
import GcodefilesPanelList from '@/components/panels/Gcodefiles/GcodefilesPanelList.vue'
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
</script>
