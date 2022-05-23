<style>
.webcamImage {
    width: 100%;
    background: lightgray;
}

.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 6px;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 3px 10px;
    border-top-left-radius: 5px;
}
</style>

<template>
    <div style="position: relative">
        <img
            ref="image"
            v-observe-visibility="visibilityChanged"
            class="webcamImage"
            :style="webcamStyle"
            @load="onload" />
        <span v-if="showFps" class="webcamFpsOutput">{{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}</span>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

const CONTENT_LENGTH = 'content-length'
const TYPE_JPEG = 'image/jpeg'

@Component
export default class Mjpegstreamer extends Mixins(BaseMixin) {
    private currentFPS = 0
    private streamState = false
    private aspectRatio: null | number = null
    private timerFPS: number | null = null
    private timerRestart: number | null = null
    private stream: ReadableStream | null = null
    private controller: AbortController | null = null

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    @Prop({ default: true }) declare showFps: boolean

    declare $refs: {
        canvas: HTMLCanvasElement
        image: HTMLImageElement
    }

    get url() {
        const baseUrl = this.camSettings.urlStream
        const url = new URL(baseUrl, this.printerUrl === undefined ? this.hostUrl.toString() : this.printerUrl)

        return decodeURIComponent(url.toString())
    }

    get webcamStyle() {
        const output = {
            transition: 'none',
            paddingTop: 16 / 9,
        }

        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimStart().length) output.transition = transforms.trimStart()

        if (this.aspectRatio) output.paddingTop = this.aspectRatio

        return output
    }

    get fpsOutput() {
        return this.currentFPS < 10 ? '0' + this.currentFPS.toString() : this.currentFPS
    }

    startStream() {
        this.streamState = true

        const SOI = new Uint8Array(2)
        SOI[0] = 0xff
        SOI[1] = 0xd8

        function getLength(headers: any) {
            let contentLength = -1
            headers.split('\n').forEach((header: any) => {
                const pair = header.split(':')
                if (pair[0].toLowerCase() === CONTENT_LENGTH) {
                    // Fix for issue https://github.com/aruntj/mjpeg-readable-stream/issues/3 suggested by martapanc
                    contentLength = pair[1]
                }
            })
            return contentLength
        }

        this.controller = new AbortController()
        const { signal } = this.controller

        //readable stream credit to from https://github.com/aruntj/mjpeg-readable-stream
        fetch(this.url, { signal, mode: 'cors' })
            .then((response) => response.body)
            .then((rb) => {
                const reader = rb?.getReader()

                let headers = ''
                let contentLength = -1
                let imageBuffer: any = null
                let bytesRead = 0
                const img = this.$refs.image

                // calculating fps. This is pretty lame. Should probably implement a floating window function.
                let frames = 0

                this.timerFPS = setInterval(() => {
                    this.currentFPS = frames
                    frames = 0
                }, 1000)

                this.timerRestart = setInterval(() => {
                    this.restartStream()
                }, 60000)

                this.stream = new ReadableStream({
                    start(controller) {
                        // The following function handles each data chunk
                        const pump = (): any => {
                            // "done" is a Boolean and value a "Uint8Array"
                            return reader?.read().then(({ done, value }) => {
                                // If there is no more data to read
                                if (done) {
                                    window.console.log('done')
                                    controller.close()
                                    return
                                }
                                // Get the data and send it to the browser via the controller
                                controller.enqueue(value)

                                if (value) {
                                    for (let index = 0; index < value.length; index++) {
                                        // we've found start of the frame. Everything we've read till now is the header.
                                        if (value[index] === SOI[0] && value[index + 1] === SOI[1]) {
                                            contentLength = getLength(headers)
                                            imageBuffer = new Uint8Array(new ArrayBuffer(contentLength))
                                        }
                                        // we're still reading the header.
                                        if (contentLength <= 0) {
                                            headers += String.fromCharCode(value[index])
                                        }
                                        // we're now reading the jpeg.
                                        else if (bytesRead < contentLength) {
                                            imageBuffer[bytesRead++] = value[index]
                                        }
                                        // we're done reading the jpeg. Time to render it.
                                        else {
                                            if (img) {
                                                img.src = URL.createObjectURL(
                                                    new Blob([imageBuffer], { type: TYPE_JPEG })
                                                )
                                                img.onload = () => URL.revokeObjectURL(img.src)
                                            }
                                            frames++
                                            contentLength = 0
                                            bytesRead = 0
                                            headers = ''
                                        }
                                    }
                                }

                                return pump()
                            })
                        }

                        return pump()
                    },
                })
            })
    }

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
        this.startStream()
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
        this.stopStream()
    }

    stopStream() {
        this.streamState = false
        URL.revokeObjectURL(this.url)
        if (this.timerFPS) clearTimeout(this.timerFPS)
        if (this.timerRestart) clearTimeout(this.timerRestart)
        this.controller?.abort()
        this.stream?.cancel()
    }

    async restartStream() {
        this.stopStream()
        this.startStream()
    }

    @Watch('url')
    urlChanged() {
        this.aspectRatio = null
        this.restartStream()
    }

    // this function check if you changed the browser tab
    documentVisibilityChanged() {
        const visibility = document.visibilityState
        this.visibilityChanged(visibility === 'visible')
    }

    // this function is to stop the stream, on scroll or on collapse the webcam panel
    visibilityChanged(newVal: boolean) {
        if (newVal && this.streamState) return

        if (newVal) {
            this.startStream()
            return
        }

        this.stopStream()
    }

    onload() {
        if (this.aspectRatio === null && this.$refs.image) {
            this.aspectRatio = this.$refs.image.naturalHeight / this.$refs.image.naturalWidth
        }
    }
}
</script>
