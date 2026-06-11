import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
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

export function useWebcam() {
    const store = useStore()
    const base = useBase()

    function convertUrl(baseUrl: string, printerUrl: string | null) {
        let url = new URL(baseUrl, base.hostUrl.toString())

        if (printerUrl !== null) url = new URL(baseUrl, printerUrl)

        if (baseUrl.startsWith('http') || baseUrl.startsWith('://')) url = new URL(baseUrl)

        if (baseUrl.startsWith('/webcam')) {
            const ports = [80]
            ports.push(store.state.server.config?.config?.server?.port ?? 7125)
            ports.push(store.state.server.config?.config?.server?.ssl_port ?? 7130)

            if (!ports.includes(base.hostPort.value)) url.port = base.hostPort.value.toString()
        }

        return decodeURIComponent(url.toString())
    }

    function convertWebcamIcon(iconName: string): string {
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

    function generateTransform(
        flip_horizontal: boolean,
        flip_vertical: boolean,
        rotation: number,
        aspect_ratio: number = 1
    ) {
        const transforms = []
        if (flip_horizontal) transforms.push('scaleX(-1)')
        if (flip_vertical) transforms.push('scaleY(-1)')
        if (rotation != 0) {
            transforms.push(`rotate(${rotation}deg)`)

            if (aspect_ratio != 1 && rotation != 180) transforms.push(`scale(${1 / aspect_ratio})`)
        }

        if (transforms.length) return transforms.join(' ')

        return 'none'
    }

    function getWrapperStyle(aspectRatio: number | null, rotation: number) {
        if (aspectRatio == null || aspectRatio == 1 || rotation == 0 || rotation == 180) return {}

        if (aspectRatio < 1 && (rotation == 90 || rotation == 270)) {
            return { aspectRatio: 1 / aspectRatio }
        }

        return { aspectRatio: aspectRatio }
    }

    function updateAspectRatioFromVideo(
        videoElement: HTMLVideoElement | null | undefined
    ): number | null {
        const w = videoElement?.videoWidth
        const h = videoElement?.videoHeight

        if (!w || !h) return null

        return w / h
    }

    function updateAspectRatioFromImage(
        imageElement: HTMLImageElement | null | undefined
    ): number | null {
        const w = imageElement?.naturalWidth
        const h = imageElement?.naturalHeight

        if (!w || !h) return null

        return w / h
    }

    return {
        ...base,
        convertUrl,
        convertWebcamIcon,
        generateTransform,
        getWrapperStyle,
        updateAspectRatioFromVideo,
        updateAspectRatioFromImage,
    }
}
