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

    generateTransform(flip_horizontal: boolean, flip_vertical: boolean, rotation: number) {
        let transforms = ''
        if (flip_horizontal) transforms += ' scaleX(-1)'
        if (flip_vertical) transforms += ' scaleY(-1)'
        if (rotation === 180) transforms += ' rotate(180deg)'

        // return transform when exist
        if (transforms.trimStart().length) return transforms.trimStart()

        // return none as fallback
        return 'none'
    }
}
