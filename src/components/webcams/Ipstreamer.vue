<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <video :src="url" autoplay :style="webcamStyle" class="webcamImage" v-observe-visibility="visibilityChanged" />
</template>

<script>
    export default {
        data: function() {
            return {
                isVisible: true,
            }
        },
        props: {
            camSettings: Object,
        },
        computed: {
            url() {
                if (this.isVisible) return this.camSettings.url || ""

                return ""
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
            }
        }
    }
</script>