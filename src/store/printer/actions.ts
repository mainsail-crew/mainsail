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
        dispatch('socket/addInitModule', 'printer/initTempHistory', { root: true })
        dispatch('socket/addInitModule', 'server/gcode_store', { root: true })

        Vue.$socket.emit('printer.info', {}, { action: 'printer/getInfo' })
        Vue.$socket.emit('server.gcode_store', {}, { action: 'server/getGcodeStore' })

        dispatch('initSubscripts')
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
            app_name: payload.app ?? null,
            hostname: payload.hostname,
            software_version: payload.software_version,
            cpu_info: payload.cpu_info,
        })

        dispatch('socket/removeInitModule', 'printer/info', { root: true })
    },

    async initSubscripts({ dispatch }) {
        const payload = await Vue.$socket.emitAndWait('printer.objects.list')

        let subscripts = {}
        const blocklist = ['menu']

        payload.objects.forEach((key: string) => {
            const nameSplit = key.split(' ')

            if (!blocklist.includes(nameSplit[0])) subscripts = { ...subscripts, [key]: null }
        })

        if (Object.keys(subscripts).length > 0) {
            const result = await Vue.$socket.emitAndWait('printer.objects.subscribe', { objects: subscripts }, {})

            // reset screws_tilt_adjust if it exists
            if ('screws_tilt_adjust' in result.status) {
                result.status.screws_tilt_adjust.error = false
                result.status.screws_tilt_adjust.results = {}
            }

            dispatch('getData', result)

            setTimeout(() => {
                dispatch('initExtruderCanExtrude')
            }, 200)
        }

        Vue.$socket.emit('server.temperature_store', { include_monitors: true }, { action: 'printer/tempHistory/init' })

        dispatch('socket/removeInitModule', 'printer/initSubscripts', { root: true })
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

    async initGcodes({ commit }) {
        const gcodes = await Vue.$socket.emitAndWait('printer.objects.query', { objects: { gcode: ['commands'] } }, {})

        commit('setData', gcodes.status)
    },

    async initExtruderCanExtrude({ dispatch, state }) {
        const extruderList: string[] = Object.keys(state).filter((name) => name.startsWith('extruder'))
        const reInitList: { [key: string]: string[] } = {}

        extruderList.forEach((extruderName) => {
            reInitList[extruderName] = ['can_extrude']
        })

        const result = await Vue.$socket.emitAndWait('printer.objects.query', { objects: reInitList }, {})
        dispatch('getData', result.status)
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
            return
        }

        Vue.$socket.emit('printer.gcode.script', { script: payload }, { loading: 'sendGcode' })
    },

    clearScrewsTiltAdjust({ commit }) {
        commit('clearScrewsTiltAdjust')
    },
}
