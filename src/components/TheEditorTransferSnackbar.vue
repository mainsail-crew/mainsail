<template>
    <v-snackbar :value="items.length > 0" :timeout="-1" fixed right bottom>
        <div v-for="(item, index) in items" :key="item.type" :class="{ 'mt-3': index > 0 }">
            <div class="d-flex align-center">
                <div class="flex-grow-1 text-truncate">
                    {{ item.label }}
                    <br />
                    <strong>{{ item.filename }}</strong>
                </div>
                <v-btn color="red" icon small class="ml-2" @click="cancel(item.type)">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
            </div>
            <template v-if="item.total > 0">
                <span class="mr-1">({{ item.loadedFormatted }}/{{ item.totalFormatted }})</span>
                {{ item.percent }} % @ {{ item.speed }}/s
                <v-progress-linear class="mt-2" :value="item.percent" />
            </template>
            <v-progress-linear v-else class="mt-2" indeterminate />
        </div>
    </v-snackbar>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiClose } from '@mdi/js'
import { formatFilesize } from '@/plugins/helpers'
import type { EditorLoader, EditorRequestType, EditorState } from '@/store/editor/types'

interface TransferItem {
    type: EditorRequestType
    label: string
    filename: string
    speed: string
    total: number
    percent: number
    loadedFormatted: string
    totalFormatted: string
}

const LABEL_KEYS: Record<EditorRequestType, string> = {
    download: 'Editor.Downloading',
    upload: 'Editor.Uploading',
}

@Component
export default class TheEditorTransferSnackbar extends Mixins(BaseMixin) {
    mdiClose = mdiClose

    get loaders(): EditorState['loaders'] {
        return this.$store.state.editor.loaders
    }

    get items(): TransferItem[] {
        return (Object.entries(this.loaders) as [EditorRequestType, EditorLoader][])
            .filter(([, loader]) => loader.isLoading)
            .map(([type, loader]) => ({
                type,
                label: this.$t(LABEL_KEYS[type]).toString(),
                filename: loader.filename,
                speed: loader.speed,
                total: loader.total,
                percent: loader.total > 0 ? Math.min(100, Math.round((100 * loader.loaded) / loader.total)) : 0,
                loadedFormatted: formatFilesize(loader.loaded),
                totalFormatted: formatFilesize(loader.total),
            }))
    }

    cancel(type: EditorRequestType): void {
        this.$store.dispatch('editor/cancelLoad', type)
    }
}
</script>
