<template>
    <div v-if="current_filename" class="statusPanel-printstatus-thumbnail">
        <v-img
            v-if="boolBigThumbnail"
            ref="bigThumbnail"
            :src="thumbnailBig"
            tabindex="-1"
            class="d-flex align-end statusPanel-big-thumbnail"
            height="200"
            :style="thumbnailStyle"
            @focus="focusBigThumbnail"
            @blur="blurBigThumbnail">
            <v-card-title
                class="white--text py-2 px-2"
                style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(3px)">
                <v-row>
                    <v-col style="width: 100px">
                        <span class="subtitle-2 text-truncate px-0 text--disabled d-block">
                            <v-icon small class="mr-2">{{ mdiFileOutline }}</v-icon>
                            {{ current_filename }}
                        </span>
                    </v-col>
                </v-row>
            </v-card-title>
        </v-img>
        <template v-else>
            <v-container>
                <v-row>
                    <v-col
                        :class="thumbnailSmall ? 'py-3' : 'py-2'"
                        :style="thumbnailSmall ? 'width: calc(100% - 40px);' : ''">
                        <span class="subtitle-2 text-truncate d-block px-0 text--disabled">
                            <v-icon small class="mr-2">{{ mdiFileOutline }}</v-icon>
                            {{ current_filename }}
                        </span>
                    </v-col>
                    <v-col v-if="thumbnailSmall" class="pa-2 pl-0 col-auto">
                        <template v-if="thumbnailSmall && thumbnailBig">
                            <v-tooltip top content-class="tooltip__content-opacity1">
                                <template #activator="{ on, attrs }">
                                    <vue-load-image class="d-flex">
                                        <img
                                            slot="image"
                                            :src="thumbnailSmall"
                                            width="32"
                                            height="32"
                                            :alt="current_filename"
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
                                <span><img :src="thumbnailBig" width="250" :alt="current_filename" /></span>
                            </v-tooltip>
                        </template>
                        <template v-else-if="thumbnailSmall">
                            <vue-load-image>
                                <img
                                    slot="image"
                                    :src="thumbnailSmall"
                                    width="32"
                                    height="32"
                                    :alt="current_filename" />
                                <div slot="preloader">
                                    <v-progress-circular indeterminate color="primary" />
                                </div>
                                <div slot="error">
                                    <v-icon>{{ mdiFile }}</v-icon>
                                </div>
                            </vue-load-image>
                        </template>
                    </v-col>
                </v-row>
            </v-container>
        </template>
        <resize-observer @notify="handleResize" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { mdiFileOutline, mdiFile } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'

@Component({})
export default class StatusPanelPrintstatusThumbnail extends Mixins(BaseMixin) {
    mdiFileOutline = mdiFileOutline
    mdiFile = mdiFile

    declare $refs: {
        bigThumbnail: any
    }

    get current_filename() {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get current_file() {
        return this.$store.state.printer.current_file ?? {}
    }

    get thumbnailBig() {
        if ('thumbnails' in this.current_file && this.current_file.thumbnails.length) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'relative_path' in thumbnail) {
                let relative_url = ''
                if (this.current_file.filename.lastIndexOf('/') !== -1) {
                    relative_url = this.current_file.filename.substr(0, this.current_file.filename.lastIndexOf('/') + 1)
                }

                if (thumbnail && 'relative_path' in thumbnail) {
                    return `${this.apiUrl}/server/files/gcodes/${encodeURI(
                        relative_url + thumbnail.relative_path
                    )}?timestamp=${this.current_file.modified}`
                }
            }
        }

        return ''
    }

    get thumbnailBigHeight() {
        if ('thumbnails' in this.current_file && this.current_file.thumbnails.length) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'height' in thumbnail) {
                return thumbnail.height
            }
        }

        return 200
    }

    get thumbnailBigWidth() {
        if ('thumbnails' in this.current_file && this.current_file.thumbnails.length) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'width' in thumbnail) {
                return thumbnail.width
            }
        }

        return 300
    }

    get thumbnailSmall() {
        if ('thumbnails' in this.current_file && this.current_file.thumbnails.length) {
            const thumbnail = this.current_file.thumbnails.find(
                (thumb: any) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )

            if (thumbnail && 'relative_path' in thumbnail) {
                let relative_url = ''
                if (this.current_file.filename.lastIndexOf('/') !== -1) {
                    relative_url = this.current_file.filename.substr(0, this.current_file.filename.lastIndexOf('/') + 1)
                }

                if (thumbnail && 'relative_path' in thumbnail) {
                    return `${this.apiUrl}/server/files/gcodes/${encodeURI(
                        relative_url + thumbnail.relative_path
                    )}?timestamp=${this.current_file.modified}`
                }
            }
        }

        return ''
    }

    get boolBigThumbnail() {
        const setting = this.$store.state.gui.uiSettings.boolBigThumbnail ?? true

        return this.current_filename && setting && this.thumbnailBig
    }

    get bigThumbnailBackground() {
        return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
    }

    get thumbnailStyle() {
        if (defaultBigThumbnailBackground.toLowerCase() !== this.bigThumbnailBackground.toLowerCase()) {
            return { backgroundColor: this.bigThumbnailBackground }
        }

        return {}
    }

    focusBigThumbnail() {
        if (this.$refs.bigThumbnail) {
            const clientWidth = this.$refs.bigThumbnail.$el.clientWidth
            const thumbnailWidth = this.thumbnailBigWidth
            const factor = clientWidth / thumbnailWidth

            this.$refs.bigThumbnail.$el.style.height = (this.thumbnailBigHeight * factor).toFixed() + 'px'
        }
    }

    blurBigThumbnail() {
        if (this.$refs.bigThumbnail) {
            this.$refs.bigThumbnail.$el.style.height = '200px'
        }
    }

    @Debounce(200)
    handleResize() {
        this.$nextTick(() => {
            const isFocused = document.activeElement === this.$refs.bigThumbnail?.$el
            if (isFocused) this.focusBigThumbnail()
        })
    }
}
</script>

<style scoped>
.statusPanel-big-thumbnail {
    transition: height 0.25s ease-out;
}

.statusPanel-printstatus-thumbnail {
    position: relative;
}
</style>
