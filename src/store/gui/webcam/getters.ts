import { GetterTree } from 'vuex'
import {GuiWebcamState} from '@/store/gui/webcam/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams:(state) => {
        const webcams = []

        Object.keys(state.webcams).forEach((id: string) => {
            webcams.push({...state.webcams[id], id})
        })

        return webcams
    },
}