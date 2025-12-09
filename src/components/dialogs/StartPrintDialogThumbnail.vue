<template>
    <div v-if="bigThumbnailUrl" class="d-flex align-center justify-center min-height-200">
        <v-img
            :src="bigThumbnailUrl"
            :max-width="maxThumbnailWidth"
            class="d-inline-block"
            :style="bigThumbnailStyle" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import { defaultBigThumbnailBackground, thumbnailBigMin } from '@/store/variables'

@Component
export default class StartPrintDialogThumbnail extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly file!: FileStateGcodefile
    @Prop({ required: true, default: '' }) readonly currentPath!: string

    get bigThumbnailBackground() {
        return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
    }

    get bigThumbnailStyle() {
        if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
            return {}
        }

        return { backgroundColor: this.bigThumbnailBackground }
    }

    get thumbnails() {
        return this.file.thumbnails ?? []
    }

    get bigThumbnail() {
        return this.thumbnails.find((thumbnail) => thumbnail.width >= thumbnailBigMin)
    }

    get currentPathWithoutSlash() {
        if (this.currentPath.startsWith('/')) return this.currentPath.substring(1)

        return this.currentPath
    }

    get fileTimestamp() {
        return typeof this.file.modified.getTime === 'function' ? this.file.modified.getTime() : 0
    }

    get bigThumbnailUrl() {
        if (this.bigThumbnail === undefined || !('relative_path' in this.bigThumbnail)) return null

        const baseArray = [this.apiUrl, 'server/files/gcodes']
        if (this.currentPathWithoutSlash) baseArray.push(this.currentPathWithoutSlash)
        baseArray.push(this.bigThumbnail.relative_path)
        const baseUrl = baseArray.join('/')

        return `${baseUrl}?timestamp=${this.fileTimestamp}`
    }

    get maxThumbnailWidth() {
        return this.bigThumbnail?.width ?? 400
    }
}
</script>

<style scoped>
.min-height-200 {
    min-height: 200px;
}
</style>
