import { GetterTree } from 'vuex'
import {GuiWebcamState, GuiWebcamStateWebcam} from '@/store/gui/webcams/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams: (state) => {
        const webcams: GuiWebcamStateWebcam[] = []

        Object.keys(state.webcams).forEach((id: string) => {
            webcams.push({...state.webcams[id], id})
        })

        return webcams
    },

    getWebcam: (state, getters) => (camId: string) => {
        const webcams = getters['getWebcams'] ?? []

        return webcams.find((webcam:GuiWebcamStateWebcam) => webcam.id === camId)
    }
}