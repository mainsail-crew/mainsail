<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <vue-load-image v-observe-visibility="visibilityChanged">
        <img slot="image" :src="url" alt="Preview" :style="webcamStyle" class="webcamImage" />
        <div slot="preloader" class="text-center py-5">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div slot="error" class="text-center py-5">
            <v-icon x-large>mdi-webcam-off</v-icon>
            <div class="subtitle-1 mt-2">{{ $t('Settings.WebcamPanel.UrlNotAvailable') }}</div>
        </div>
    </vue-load-image>
</template>

<script>
    import VueLoadImage from "vue-load-image"

    export default {
        components: {
            'vue-load-image': VueLoadImage
        },
        data: function() {
            return {
                isVisible: true,
                refresh: Math.ceil(Math.random() * Math.pow(10, 12))
            }
        },
        props: {
            camSettings: Object,
            printerUrl: {
                type: String,
                default: null
            }
        },
        created: function () {

        },
        computed: {
            url() {
                const baseUrl = this.camSettings.url
                const hostUrl = new URL(this.printerUrl === null ? document.URL : this.printerUrl)

                const url = new URL(baseUrl, hostUrl.origin)
                url.searchParams.append('bypassCache', this.refresh.toString())

                return decodeURIComponent(url.toString())
            },
            webcamStyle() {
                let transforms = ""
                if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += " scaleX(-1)"
                if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += " scaleY(-1)"
                if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

                return ""
            },
        },
        methods: {
            visibilityChanged(isVisible) {
                this.isVisible = isVisible

                if (isVisible) this.refresh = Math.ceil(Math.random() * Math.pow(10, 12))
            }
        }
    }
</script>