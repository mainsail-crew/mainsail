import { GetterTree } from 'vuex'
import { GuiHeightmapState } from './types'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiHeightmapState, RootState> = {
    getActiveColorSchemeList: (state): string[] => {
        const colorScheme = state.activecolorscheme

        switch (colorScheme) {
            case 'hsv':
                return ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000']
            case 'spring':
                return ['#ff00ff', '#ffff00']
            case 'hot':
                return ['#000000', '#ff0000', '#ffff00', '#ffffff']
            case 'grayScale':
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
