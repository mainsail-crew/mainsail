import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import {GuiWebcamState} from '@/store/gui/webcam/types'
import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const mutations: MutationTree<GuiWebcamState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    async store(state, payload) {
        const id = uuidv4()
        const webcam = {
            name: payload.name,
            icon: payload.icon,
            service: payload.service,
            targetFps: payload.targetFps,
            url: payload.url,
            flipX: payload.flipX,
            flipY: payload.flipY,
        }

        Vue.set(state.webcams, id, webcam)

        return id
    },

    update(state, payload) {
        const id = payload.id
        delete payload.id
        if (id in state.webcams) {
            const webcam = {...state.webcams[id]}
            Object.assign(webcam, payload)

            Vue.set(state.webcams, id, webcam)
        }
    },

    delete(state, payload) {
        if (payload in state.webcams) {
            Vue.delete(state.webcams, payload)
        }
    },
}