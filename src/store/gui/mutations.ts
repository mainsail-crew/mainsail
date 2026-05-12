import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiState } from '@/store/gui/types'
import { setDataDeep } from '@/plugins/helpers'

export const mutations: MutationTree<GuiState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setData(state, payload) {
        setDataDeep(state, payload)
    },

    saveSetting(state, payload: { name: string; value: unknown }) {
        const nested = payload.name.split('.').reduceRight<unknown>((value, key) => ({ [key]: value }), payload.value)
        setDataDeep(state, nested)
    },
}
