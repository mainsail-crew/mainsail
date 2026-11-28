import { ActionTree } from 'vuex'
import { FarmRegisterPrinterPayload, FarmState, FarmUpdatePrinterPayload } from '@/store/farm/types'
import { RootState } from '@/store/types'
import { printer } from '@/store/farm/printer'
import { destroyFarmClient } from '@/store/farm/printer/clients'

export const actions: ActionTree<FarmState, RootState> = {
    registerPrinter({ commit, dispatch }, payload: FarmRegisterPrinterPayload): void {
        const { id, hostname, port, path, settings } = payload
        if (this.hasModule(['farm', id])) return

        this.registerModule(['farm', id], printer)
        commit(`${id}/setId`, id)
        commit(`${id}/setSocket`, { hostname, port, path })
        if (settings) commit(`${id}/setSettings`, settings)

        dispatch(`${id}/connect`)
    },

    updatePrinter({ commit, dispatch }, payload: FarmUpdatePrinterPayload): void {
        const { id, hostname, port, path } = payload
        if (!this.hasModule(['farm', id])) return

        commit(`${id}/setSocket`, { hostname, port, path })
        dispatch(`${id}/connect`)
    },

    unregisterPrinter(_context, id: string): void {
        if (!this.hasModule(['farm', id])) return

        destroyFarmClient(id)
        this.unregisterModule(['farm', id])
    },
}
