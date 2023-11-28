import { GetterTree } from 'vuex'
import { HeightmapState } from './types'

export const getters: GetterTree<HeightmapState, any> = {
    getActiveColorSchemeList: (state): string[] => {
        switch (state.activecolorscheme.toLowerCase()) {
            case 'hsv':
                return ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000']
            case 'spring':
                return ['#ff00ff', '#ffff00']
            case 'hot':
                return ['#000000', '#ff0000', '#ffff00', '#ffffff']
            case 'grayscale':
                return ['#ffffff', '#000000']
            default:
                // Portland colorscheme is being used as default.
                return [
                    '#313695',
                    '#4575b4',
                    '#74add1',
                    '#abd9e9',
                    '#e0f3f8',
                    '#ffffbf',
                    '#fee090',
                    '#fdae61',
                    '#f46d43',
                    '#d73027',
                    '#a50026',
                ]
        }
    },
}
