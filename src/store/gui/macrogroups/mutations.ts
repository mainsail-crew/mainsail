import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import Vue from 'vue'
import {GuiMacrogroupsState, GuiMacrogroupsStateMacrogroupMacro} from '@/store/gui/macrogroups/types'

export const mutations: MutationTree<GuiMacrogroupsState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'macrogroups', payload.value)
    },

    store(state, payload) {
        Vue.set(state.macrogroups, payload.id, payload.values)
    },

    update(state, payload) {
        if (payload.id in state.macrogroups) {
            const preset = {...state.macrogroups[payload.id]}
            Object.assign(preset, payload.values)

            Vue.set(state.macrogroups, payload.id, preset)
        }
    },

    addMacroToMacrogroup(state, payload) {
        const macros = [...state.macrogroups[payload.id]?.macros ?? []]

        const newMacro: GuiMacrogroupsStateMacrogroupMacro = {
            pos: 1,
            name: payload.macro,
            color: 'group',
            showInStandby: true,
            showInPrinting: true,
            showInPause: true
        }

        if (macros.length) newMacro.pos = Math.max(...macros.map((m: GuiMacrogroupsStateMacrogroupMacro) => m.pos)) + 1
        macros.push(newMacro)

        Vue.set(state.macrogroups[payload.id], 'macros', macros)
    },

    updateMacroFromMacrogroup(state, payload) {
        const macros = [...state.macrogroups[payload.id]?.macros ?? []]
        const updateMacroIndex = macros.findIndex((m: GuiMacrogroupsStateMacrogroupMacro) => m.name === payload.macro)
        if (updateMacroIndex !== -1) {
            const macro = macros[updateMacroIndex]
            // @ts-ignore
            macro[payload.option] = payload.value
            Vue.set(state.macrogroups[payload.id], 'macros', macros)
        }
    },

    removeMacroFromMacrogroup(state, payload) {
        const macros = [...state.macrogroups[payload.id]?.macros ?? []]
        const deletedMacroIndex = macros.findIndex((m: GuiMacrogroupsStateMacrogroupMacro) => m.name === payload.macro)
        if (deletedMacroIndex !== -1) {
            const oldPos = macros[deletedMacroIndex].pos
            macros.splice(deletedMacroIndex, 1)

            macros.filter((macro: GuiMacrogroupsStateMacrogroupMacro) => macro.pos > oldPos).forEach((macro: GuiMacrogroupsStateMacrogroupMacro) => {
                macro.pos = macro.pos - 1
            })
        }

        Vue.set(state.macrogroups[payload.id], 'macros', macros)
    },

    delete(state, payload) {
        if (payload in state.macrogroups) {
            Vue.delete(state.macrogroups, payload)
        }
    },
}