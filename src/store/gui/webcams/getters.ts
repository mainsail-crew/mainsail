import { GetterTree } from 'vuex'
import { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams: (state) => {
        return state.webcams.filter((webcam: GuiWebcamStateWebcam) => webcam.enabled)
    },

    getWebcam: (_, getters) => (name: string) => {
        const webcams = getters['getWebcams'] ?? []

        return webcams.find((webcam: GuiWebcamStateWebcam) => webcam.name === name)
    },
}
