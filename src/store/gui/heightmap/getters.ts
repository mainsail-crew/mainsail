import {GetterTree} from "vuex";
import {HeightmapState} from "./types";

export const getters: GetterTree<HeightmapState, any> = {
    
    getActiveColorSchemeList: (state): string[] => {
        switch (state.activecolorscheme.toLowerCase()) {
            case "redgreenblue":
                return ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'];
            case "grayscale":
                return ['#ffffff', '#000000']
            case "default":
                return ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61',
                    '#f46d43', '#d73027', '#a50026']
            default:
                break;
        }
        return [];
    }
}
