<template>
    <div>
        <div class="d-flex align-center">
            <div class="flex-grow-1 text-truncate">
                {{ label }}
                <br />
                <strong>{{ loader.filename }}</strong>
            </div>
            <v-btn color="red" icon small class="ml-2" @click="cancel">
                <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
        </div>
        <template v-if="hasTotal">
            <span class="mr-1">({{ loadedFormatted }}/{{ totalFormatted }})</span>
            {{ percent }} % @ {{ loader.speed }}/s
            <v-progress-linear class="mt-2" :value="percent" />
        </template>
        <v-progress-linear v-else class="mt-2" indeterminate />
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import type { EditorLoader, EditorRequestType } from '@/store/editor/types'
import { formatFilesize } from '@/plugins/helpers'
import { mdiClose } from '@mdi/js'

const LABEL_KEYS: Record<EditorRequestType, string> = {
    download: 'Editor.Downloading',
    upload: 'Editor.Uploading',
}

@Component
export default class EditorTransferSnackbarItem extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly type!: EditorRequestType

    mdiClose = mdiClose

    get loader(): EditorLoader {
        return this.$store.state.editor.loaders[this.type]
    }

    get label(): string {
        return this.$t(LABEL_KEYS[this.type]).toString()
    }

    get hasTotal(): boolean {
        return this.loader.total > 0
    }

    get percent(): number {
        if (!this.hasTotal) return 0
        return Math.min(100, Math.round((100 * this.loader.loaded) / this.loader.total))
    }

    get loadedFormatted(): string {
        return formatFilesize(this.loader.loaded)
    }

    get totalFormatted(): string {
        return formatFilesize(this.loader.total)
    }

    cancel(): void {
        this.$store.dispatch('editor/cancelLoad', this.type)
    }
}
</script>
