import Vue from 'vue'
import { ActionTree } from 'vuex'
import { PrinterState } from '@/store/printer/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<PrinterState, RootState> = {
    reset({ commit }) {
        commit('reset')
        commit('tempHistory/reset')
        commit('socket/clearLoadings', null, { root: true })
    },

    init({ dispatch }) {
        window.console.debug('init printer')
        dispatch('reset')

        dispatch('socket/addInitModule', 'printer/info', { root: true })
        dispatch('socket/addInitModule', 'printer/initSubscripts', { root: true })
        dispatch('socket/addInitModule', 'printer/initHelpList', { root: true })
        dispatch('socket/addInitModule', 'printer/initTempHistory', { root: true })
        dispatch('socket/addInitModule', 'server/gcode_store', { root: true })

        Vue.$socket.emit('printer.info', {}, { action: 'printer/getInfo' })
        Vue.$socket.emit('printer.objects.list', {}, { action: 'printer/initSubscripts' })
        Vue.$socket.emit('printer.gcode.help', {}, { action: 'printer/initHelpList' })
        Vue.$socket.emit('server.gcode_store', {}, { action: 'server/getGcodeStore' })
    },

    getInfo({ commit, dispatch }, payload) {
        commit(
            'server/setData',
            {
                klippy_state: payload.state,
                klippy_message: payload.state_message,
            },
            { root: true }
        )

        commit('setData', {
            hostname: payload.hostname,
            software_version: payload.software_version,
            cpu_info: payload.cpu_info,
        })

        dispatch('socket/removeInitModule', 'printer/info', { root: true })
    },

    initSubscripts({ dispatch }, payload) {
        let subscripts = {}
        const blocklist = ['menu']

        payload.objects.forEach((key: string) => {
            const nameSplit = key.split(' ')

            if (!blocklist.includes(nameSplit[0])) subscripts = { ...subscripts, [key]: null }
        })

        if (Object.keys(subscripts).length > 0)
            Vue.$socket.emit('printer.objects.subscribe', { objects: subscripts }, { action: 'printer/getInitData' })
        else Vue.$socket.emit('server.temperature_store', {}, { action: 'printer/tempHistory/init' })

        dispatch('socket/removeInitModule', 'printer/initSubscripts', { root: true })
    },

    getInitData({ dispatch }, payload) {
        if ('screws_tilt_adjust' in payload.status) {
            payload.status.screws_tilt_adjust.error = false
            payload.status.screws_tilt_adjust.results = {}
        }

        dispatch('getData', payload)

        Vue.$socket.emit('server.temperature_store', {}, { action: 'printer/tempHistory/init' })

        setTimeout(() => {
            dispatch('initExtruderCanExtrude')
        }, 200)
    },

    getData({ commit, dispatch, state }, payload) {
        if ('status' in payload) payload = payload.status
        if ('requestParams' in payload) delete payload.requestParams

        if ('webhooks' in payload) {
            this.dispatch(
                'server/getData',
                { klippy_state: payload.webhooks.state, klippy_message: payload.webhooks.state_message },
                { root: true }
            )
            delete payload.webhooks
        }

        if ('bed_mesh' in state && 'bed_mesh' in payload && 'profiles' in payload.bed_mesh) {
            commit('setBedMeshProfiles', payload.bed_mesh.profiles)

            delete payload.bed_mesh['profiles']
        }

        if (payload.configfile?.settings?.printer?.kinematics) {
            dispatch(
                'gui/updateGcodeviewerCache',
                {
                    kinematics: payload.configfile?.settings?.printer?.kinematics,
                },
                { root: true }
            )
        }

        if (payload.toolhead?.axis_maximum) {
            dispatch(
                'gui/updateGcodeviewerCache',
                {
                    axis_maximum: payload.toolhead?.axis_maximum,
                },
                { root: true }
            )
        }

        if (payload.toolhead?.axis_minimum) {
            dispatch(
                'gui/updateGcodeviewerCache',
                {
                    axis_minimum: payload.toolhead?.axis_minimum,
                },
                { root: true }
            )
        }

        commit('setData', payload)
    },

    initExtruderCanExtrude({ state }) {
        const extruderList: string[] = Object.keys(state).filter((name) => name.startsWith('extruder'))
        const reInitList: { [key: string]: string[] } = {}

        extruderList.forEach((extruderName) => {
            reInitList[extruderName] = ['can_extrude']
        })

        Vue.$socket.emit('printer.objects.query', { objects: reInitList }, { action: 'printer/getData' })
    },

    initHelpList({ commit, dispatch }, payload) {
        commit('setHelplist', payload)

        dispatch('socket/removeInitModule', 'printer/initHelpList', { root: true })
    },

    getEndstopStatus({ commit }, payload) {
        commit('setEndstopStatus', payload)
    },

    removeBedMeshProfile({ commit }, payload) {
        commit('removeBedMeshProfile', payload)
    },

    sendGcode({ dispatch }, payload) {
        dispatch('server/addEvent', { message: payload, type: 'command' }, { root: true })

        if (payload.toLowerCase().trim() === 'm112') {
            Vue.$socket.emit('printer.emergency_stop', {}, { loading: 'sendGcode' })
        } else {
            Vue.$socket.emit('printer.gcode.script', { script: payload }, { loading: 'sendGcode' })
        }
    },

    clearScrewsTiltAdjust({ commit }) {
        commit('clearScrewsTiltAdjust')
    },
}
