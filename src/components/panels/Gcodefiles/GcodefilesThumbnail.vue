<template>
    <v-icon v-if="item.isDirectory">{{ mdiFolder }}</v-icon>
    <v-tooltip
        v-else-if="smallThumbnailUrl"
        top
        content-class="tooltip__content-opacity1"
        :color="bigThumbnailTooltipColor"
        :disabled="!bigThumbnailUrl">
        <template #activator="{ on, attrs }">
            <vue-load-image>
                <img
                    slot="image"
                    :src="smallThumbnailUrl"
                    width="32"
                    height="32"
                    :alt="item.filename"
                    v-bind="attrs"
                    v-on="on" />
                <div slot="preloader">
                    <v-progress-circular indeterminate color="primary" />
                </div>
                <div slot="error">
                    <v-icon>{{ mdiFile }}</v-icon>
                </div>
            </vue-load-image>
        </template>
        <span>
            <img :src="bigThumbnailUrl" width="250" :alt="item.filename" />
        </span>
    </v-tooltip>
    <v-icon v-else>{{ mdiFile }}</v-icon>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiFile, mdiFolder } from '@mdi/js'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { escapePath } from '@/plugins/helpers'

@Component
export default class GcodefilesThumbnail extends Mixins(BaseMixin) {
    mdiFile = mdiFile
    mdiFolder = mdiFolder

    @Prop({ type: Object }) declare readonly item: FileStateGcodefile

    get bigThumbnailBackground() {
        return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
    }

    get bigThumbnailTooltipColor() {
        if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
            return undefined
        }

        return this.bigThumbnailBackground
    }

    get fileTimestamp() {
        return typeof this.item.modified.getTime === 'function' ? this.item.modified.getTime() : 0
    }

    get thumbnails() {
        return this.item.thumbnails ?? []
    }

    get subdirectory() {
        if (!this.item.full_filename.includes('/')) return null

        return escapePath(this.item.full_filename.substring(0, this.item.full_filename.lastIndexOf('/')))
    }

    get smallThumbnail() {
        return this.thumbnails.find(
            (thumbnail) =>
                thumbnail.width >= thumbnailSmallMin &&
                thumbnail.width <= thumbnailSmallMax &&
                thumbnail.height >= thumbnailSmallMin &&
                thumbnail.height <= thumbnailSmallMax
        )
    }

    get smallThumbnailUrl() {
        if (this.smallThumbnail === undefined || !('relative_path' in this.smallThumbnail)) return null

        return this.buildUrl(this.smallThumbnail.relative_path)
    }

    get bigThumbnail() {
        return this.thumbnails.find((thumbnail) => thumbnail.width >= thumbnailBigMin)
    }

    get bigThumbnailUrl() {
        if (this.bigThumbnail === undefined || !('relative_path' in this.bigThumbnail)) return null

        return this.buildUrl(this.bigThumbnail.relative_path)
    }

    buildUrl(relativePath: string) {
        const baseArray = [this.apiUrl, 'server/files/gcodes']
        if (this.subdirectory !== null) {
            let subdirectory = this.subdirectory
            if (subdirectory.startsWith('/')) subdirectory = subdirectory.substring(1)

            baseArray.push(subdirectory)
        }
        baseArray.push(relativePath)
        const baseUrl = baseArray.join('/')

        return `${baseUrl}?timestamp=${this.fileTimestamp}`
    }
}
</script>
