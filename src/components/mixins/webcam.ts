import Component from 'vue-class-component'
import {
    mdiAlbum,
    mdiCampfire,
    mdiDoor,
    mdiRadiatorDisabled,
    mdiPrinter3d,
    mdiPrinter3dNozzle,
    mdiRaspberryPi,
    mdiWebcam,
} from '@mdi/js'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class WebcamMixin extends Mixins(BaseMixin) {
    convertUrl(baseUrl: string, printerUrl: string | null) {
        let url = new URL(baseUrl, this.hostUrl.toString())

        // use printerURL if it exists
        if (printerUrl !== null) url = new URL(baseUrl, printerUrl)

        // overwrite url to baseUrl, if it is an absolute URL
        if (baseUrl.startsWith('http') || baseUrl.startsWith('://')) url = new URL(baseUrl)

        if (baseUrl.startsWith('/webcam')) {
            const ports = [80]
            ports.push(this.$store.getters['server/getConfigValue']('server', 'port', 7125))
            ports.push(this.$store.getters['server/getConfigValue']('server', 'ssl_port', 7130))

            if (!ports.includes(this.hostPort)) url.port = this.hostPort.toString()
        }

        return decodeURIComponent(url.toString())
    }

    convertWebcamIcon(iconName: string): string {
        switch (iconName) {
            case 'mdiAlbum':
                return mdiAlbum
            case 'mdiCampfire':
                return mdiCampfire
            case 'mdiDoor':
                return mdiDoor
            case 'mdiRadiatorDisabled':
                return mdiRadiatorDisabled
            case 'mdiPrinter3d':
                return mdiPrinter3d
            case 'mdiPrinter3dNozzle':
                return mdiPrinter3dNozzle
            case 'mdiRaspberryPi':
                return mdiRaspberryPi

            default:
                return mdiWebcam
        }
    }

    generateTransform(flip_horizontal: boolean, flip_vertical: boolean, rotation: number, aspect_ratio: number = 1) {
        const transforms = []
        if (flip_horizontal) transforms.push('scaleX(-1)')
        if (flip_vertical) transforms.push('scaleY(-1)')
        if (rotation != 0) {
            transforms.push(`rotate(${rotation}deg)`)

            if (aspect_ratio != 1 && rotation != 180) transforms.push(`scale(${1 / aspect_ratio})`)
        }

        // return transform when exist
        if (transforms.length) return transforms.join(' ')

        // return none as fallback
        return 'none'
    }

    getWrapperStyle(aspectRatio: number | null, rotation: number) {
        if (aspectRatio == null || aspectRatio == 1 || rotation == 0 || rotation == 180) return {}

        if (aspectRatio < 1 && (rotation == 90 || rotation == 270)) {
            return { aspectRatio: 1 / aspectRatio }
        }

        return { aspectRatio: aspectRatio }
    }

    updateAspectRatioFromVideo(videoElement: HTMLVideoElement | null | undefined): number | null {
        const w = videoElement?.videoWidth
        const h = videoElement?.videoHeight

        if (!w || !h) return null

        return w / h
    }

    updateAspectRatioFromImage(imageElement: HTMLImageElement | null | undefined): number | null {
        const w = imageElement?.naturalWidth
        const h = imageElement?.naturalHeight

        if (!w || !h) return null

        return w / h
    }
}
