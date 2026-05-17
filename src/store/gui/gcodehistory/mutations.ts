import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'

export const mutations: MutationTree<GuiGcodehistoryState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },
}
