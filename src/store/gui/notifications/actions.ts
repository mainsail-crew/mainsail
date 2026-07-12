import { ActionTree } from 'vuex'
import { GuiNotificationCategory, GuiNotificationState, GuiNotificationStateDismissEntry } from './types'
import { RootState } from '../../types'

function extractIdCategory(input: string): { entry_id: string | undefined; category: string | undefined } {
    const posFirstSlash = input.indexOf('/')
    if (posFirstSlash === -1) return { entry_id: undefined, category: undefined }

    const category = input.slice(0, posFirstSlash)
    const entry_id = input.slice(posFirstSlash + 1)

    return { entry_id, category }
}

export const actions: ActionTree<GuiNotificationState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async upload({ dispatch, state }): Promise<void> {
        await dispatch('gui/saveSetting', { name: 'notifications.dismiss', value: state.dismiss }, { root: true })
    },

    async close({ dispatch }, id: string): Promise<void> {
        const { entry_id, category } = extractIdCategory(id)
        if (!entry_id) return

        if (category === 'announcement') {
            await dispatch('server/announcements/close', { entry_id }, { root: true })
            return
        }

        await dispatch('storeDismiss', {
            entry_id,
            category,
            type: 'ever',
            time: null,
        })
    },

    async dismiss(
        { dispatch },
        payload: { id: string; type: GuiNotificationStateDismissEntry['type']; time: number | null }
    ): Promise<void> {
        const { entry_id, category } = extractIdCategory(payload.id)
        if (!entry_id) return

        if (category === 'announcement') {
            await dispatch('server/announcements/dismiss', { entry_id, time: payload.time }, { root: true })
            return
        }

        await dispatch('storeDismiss', {
            entry_id,
            category,
            type: payload.type,
            time: payload.time,
        })
    },

    async storeDismiss(
        { commit, dispatch, state },
        payload: {
            entry_id: string
            category: GuiNotificationCategory
            type: GuiNotificationStateDismissEntry['type']
            time: number | null
        }
    ): Promise<void> {
        let date = new Date().getTime()
        if (payload.type === 'time') {
            date = new Date().getTime() + (payload.time ?? 0) * 1000
        }

        const newDismiss: GuiNotificationStateDismissEntry = {
            id: payload.entry_id,
            category: payload.category,
            type: payload.type,
            date,
        }

        if (
            state.dismiss.filter(
                (dismiss) =>
                    dismiss.id === newDismiss.id &&
                    dismiss.category === newDismiss.category &&
                    dismiss.type === newDismiss.type
            ).length
        ) {
            commit('removeDismiss', newDismiss)
        }

        commit('addDismiss', newDismiss)
        await dispatch('upload')
    },
}
