import { GetterTree } from 'vuex'
import {
    GuiRemoteprintersState,
    GuiRemoteprintersStatePrinter
} from '@/store/gui/remoteprinters/types'
import {caseInsensitiveSort} from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<GuiRemoteprintersState, any> = {
    getRemoteprinters: (state, getters, rootState, rootGetters) => {
        const remoteprinters: GuiRemoteprintersStatePrinter[] = []

        Object.keys(state.remoteprinters).forEach((id: string) => {
            const socket = {...rootGetters['farm/getPrinterSocketState'](id)}

            remoteprinters.push({...state.remoteprinters[id], id, socket})
        })

        return caseInsensitiveSort(remoteprinters, 'hostname')
    },
}