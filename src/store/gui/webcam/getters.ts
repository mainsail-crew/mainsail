import { GetterTree } from 'vuex'
import {GuiWebcamState} from '@/store/gui/webcam/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams:(state) => {
        return state.webcams
    },
}