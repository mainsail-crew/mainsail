import { GetterTree } from 'vuex'
import { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiWebcamState, RootState> = {
    getWebcams: (state): GuiWebcamStateWebcam[] => {
        return state.webcams.filter((webcam: GuiWebcamStateWebcam) => webcam.enabled)
    },

    getWebcamByName:
        (state) =>
        (name: string): GuiWebcamStateWebcam | undefined =>
            state.webcams.find((webcam) => webcam.name === name),
}
