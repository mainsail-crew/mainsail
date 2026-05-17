import { ActionContext, ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { GuiMacrosState, GuiMacrosStateMacrogroup, GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import { GuiStateDashboard } from '@/store/gui/types'

export const actions: ActionTree<GuiMacrosState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async saveSetting<T extends keyof GuiMacrosState>(
        { dispatch }: ActionContext<GuiMacrosState, RootState>,
        payload: { name: T; value: GuiMacrosState[T] }
    ): Promise<void> {
        const key = `macros.${payload.name}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },

    async saveMacrogroup({ dispatch }, payload: { id: string; value: GuiMacrosStateMacrogroup }): Promise<void> {
        await dispatch('saveSetting', { name: `macrogroups.${payload.id}`, value: payload.value })
    },

    async groupStore({ dispatch }, value: GuiMacrosStateMacrogroup): Promise<string> {
        const id = uuidv4()
        await dispatch('saveMacrogroup', { id, value })

        return id
    },

    async groupUpdate(
        { dispatch, state },
        payload: { id: string; values: Partial<GuiMacrosStateMacrogroup> }
    ): Promise<void> {
        if (!(payload.id in state.macrogroups)) return

        const group = { ...state.macrogroups[payload.id], ...payload.values }
        await dispatch('saveMacrogroup', { id: payload.id, value: group })
    },

    async addMacroToMacrogroup({ dispatch, state }, payload: { id: string; macro: string }): Promise<void> {
        if (!(payload.id in state.macrogroups)) return
        const group = state.macrogroups[payload.id]
        const macros = [...(group.macros ?? [])]
        const lastPos = Math.max(...macros.map((m: GuiMacrosStateMacrogroupMacro) => m.pos), 0)

        macros.push({
            pos: lastPos + 1,
            name: payload.macro,
            color: 'group',
            showInStandby: true,
            showInPrinting: true,
            showInPause: true,
        })

        await dispatch('groupUpdate', { id: payload.id, values: { macros } })
    },

    async updateMacroFromMacrogroup<T extends keyof GuiMacrosStateMacrogroupMacro>(
        { dispatch, state }: ActionContext<GuiMacrosState, RootState>,
        payload: { id: string; macro: string; option: T; value: GuiMacrosStateMacrogroupMacro[T] }
    ): Promise<void> {
        if (!(payload.id in state.macrogroups)) return
        const group = state.macrogroups[payload.id]
        const macros = [...(group.macros ?? [])]
        const macroIndex = macros.findIndex((m: GuiMacrosStateMacrogroupMacro) => m.name === payload.macro)
        if (macroIndex === -1) return

        macros[macroIndex] = { ...macros[macroIndex], [payload.option]: payload.value }
        await dispatch('groupUpdate', { id: payload.id, values: { macros } })
    },

    async removeMacroFromMacrogroup({ dispatch, state }, payload: { id: string; macro: string }): Promise<void> {
        if (!(payload.id in state.macrogroups)) return
        const group = state.macrogroups[payload.id]
        const macros = [...(group.macros ?? [])]

        const macroIndex = macros.findIndex((m) => m.name === payload.macro)
        if (macroIndex === -1) return

        const oldPos = macros[macroIndex].pos
        macros.splice(macroIndex, 1)
        macros.filter((m) => m.pos > oldPos).forEach((m) => m.pos--)

        await dispatch('groupUpdate', { id: payload.id, values: { macros } })
    },

    async groupDelete({ commit, dispatch, rootState }, id: string): Promise<void> {
        commit('groupDelete', id)
        const key = `macros.macrogroups.${id}`
        await dispatch('gui/deleteSetting', key, { root: true })

        type DashboardLayoutKey = Exclude<keyof GuiStateDashboard, 'nonExpandPanels'>
        const layouts = Object.keys(rootState.gui?.dashboard ?? {}).filter(
            (key) => key !== 'nonExpandPanels'
        ) as DashboardLayoutKey[]

        for (const layoutname of layouts) {
            const macrogroupId = `macrogroup_${id}`
            const layoutArray = [...(rootState.gui?.dashboard[layoutname] ?? [])]
            const index = layoutArray.findIndex((layoutPos) => layoutPos.name === macrogroupId)

            if (index === -1) continue

            layoutArray.splice(index, 1)
            await dispatch('gui/saveSetting', { name: `dashboard.${layoutname}`, value: layoutArray }, { root: true })
        }
    },
}
