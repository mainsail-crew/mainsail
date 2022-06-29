import Vue from 'vue'
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

@Component
export default class WebcamMixin extends Vue {
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
}
