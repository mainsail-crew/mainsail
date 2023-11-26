import {Module} from "vuex";
import {HeightmapState} from "./types";
import {getters} from "./getters";
import {actions} from "./actions";
import {mutations} from "./mutations";

export const getDefaultState = (): HeightmapState => {
    return {
        activecolorscheme: 'default'
    }
}

const state = getDefaultState()

export const heightmap: Module<HeightmapState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
