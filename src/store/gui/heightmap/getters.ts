import {GetterTree} from "vuex";
import {HeightmapState} from "./types";

export const getters: GetterTree<HeightmapState, any> = {
    getActiveColorScheme: (state): string => {
        if (state.activecolorscheme)
            return state.activecolorscheme

        return 'default'
    }
}
