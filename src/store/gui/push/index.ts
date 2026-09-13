import { Module } from 'vuex'
import { GuiPushState } from './types'
import { actions } from './actions'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiPushState => {
    return {
        vapidPublicKey: '',
        subscriptionPath: 'webpush/subscriptions.json',
        progressInterval: 25,
        runoutSensors: ['extruder'],
    }
}

const state = getDefaultState()

export const push: Module<GuiPushState, RootState> = {
    namespaced: true,
    state,
    actions,
}
