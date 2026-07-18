import { GetterTree } from 'vuex'
import { GuiRemoteprintersState, GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiRemoteprintersState, RootState> = {
    getRemoteprinters: (state, getters, rootState, rootGetters) => {
        const printers: GuiRemoteprintersStatePrinter[] = []

        Object.keys(state.printers).forEach((id: string) => {
            const socket = { ...rootGetters['farm/getPrinterSocketState'](id) }

            printers.push({ ...state.printers[id], id, socket })
        })

        return caseInsensitiveSort(printers, 'hostname')
    },
}
