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

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { mdiFileDocumentMultipleOutline } from '@mdi/js'

@Component
export default class GcodefilesPanel extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
}
</script>
