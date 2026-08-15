import { ActionTree } from 'vuex'
import { PidCalibrateEntry, PrinterPidCalibrateState } from '@/store/printer/pidCalibrate/types'
import {
    extractPreviousPid,
    isPidCalibrateFailure,
    isPidCalibrateTargetToggle,
    parsePidCalibrateCommand,
    parsePidCalibrateResult,
    shortHeaterName,
} from '@/store/printer/pidCalibrate/helpers'
import { RootState } from '@/store/types'

function oldestRunningHeaterName(state: PrinterPidCalibrateState): string | null {
    const running = Object.values(state.entries)
        .filter((entry) => entry.status === 'running')
        .sort((a, b) => a.startedAt - b.startedAt)

    return running.length ? running[0].heaterName : null
}

export const actions: ActionTree<PrinterPidCalibrateState, RootState> = {
    /**
     * Called for every outgoing gcode command Mainsail sends (console input, control buttons,
     * temperature presets, ...). No-ops unless it's a PID_CALIBRATE command - there is no
     * queryable Klipper object for "a calibration is running", so this client-side observation
     * of the command we just sent is the only way to know one started at all.
     */
    onGcodeSent({ commit, rootState, rootGetters }, gcode: string) {
        const parsed = parsePidCalibrateCommand(gcode)
        if (!parsed) return

        const availableHeaters: string[] = rootGetters['printer/getAvailableHeaters'] ?? []
        const objectName = availableHeaters.find((name) => shortHeaterName(name) === parsed.heaterName)

        // unknown heater name -> most likely a typo in the command, nothing we can usefully track
        if (!objectName) return

        const settings = rootState.printer?.configfile?.settings?.[objectName.toLowerCase()] ?? null

        const entry: PidCalibrateEntry = {
            heaterName: parsed.heaterName,
            objectName,
            target: parsed.target,
            status: 'running',
            startedAt: Date.now(),
            finishedAt: null,
            // Klipper sets the heater's target to the calibration temperature before the control
            // loop ever ticks (see PIDCalibrate.cmd_PID_CALIBRATE), so this is what we'd observe
            // first regardless - not itself a toggle.
            lastObservedTarget: parsed.target,
            observedToggles: 0,
            previous: extractPreviousPid(settings),
            result: null,
            errorMessage: null,
        }

        commit('setEntry', entry)
    },

    /**
     * Called whenever any heater's standard `target` field changes (TemperaturePanelListItem
     * watches it for every heater row). No-ops unless that heater currently has a calibration
     * tracked as running - see isPidCalibrateTargetToggle for what counts as real progress.
     */
    onTargetChanged({ commit, state }, payload: { heaterName: string; target: number }) {
        const entry = state.entries[payload.heaterName]
        if (!entry || entry.status !== 'running' || entry.lastObservedTarget === null) return
        if (!isPidCalibrateTargetToggle(entry.target, entry.lastObservedTarget, payload.target)) return

        commit('updateEntry', {
            heaterName: payload.heaterName,
            changes: {
                lastObservedTarget: payload.target,
                observedToggles: entry.observedToggles + 1,
            },
        })
    },

    /**
     * Called for every incoming console line (gcode response/action/debug/error). Watches for
     * Klipper's standard PID_CALIBRATE completion message and for command errors. The completion
     * message doesn't identify which heater it belongs to, so it's attributed to the
     * longest-running still-running entry; unattributable messages (no entry currently running,
     * e.g. a calibration started outside of Mainsail) are intentionally ignored rather than guessed.
     */
    onGcodeResponse({ commit, state }, message: string) {
        const result = parsePidCalibrateResult(message)
        if (result) {
            const heaterName = oldestRunningHeaterName(state)
            if (heaterName === null) return

            commit('updateEntry', {
                heaterName,
                changes: { status: 'success', finishedAt: Date.now(), result },
            })
            return
        }

        const heaterName = oldestRunningHeaterName(state)
        if (heaterName === null) return
        if (!isPidCalibrateFailure(message, heaterName)) return

        commit('updateEntry', {
            heaterName,
            changes: {
                status: 'failed',
                finishedAt: Date.now(),
                errorMessage: message.replace(/^!!\s*/, ''),
            },
        })
    },

    /**
     * Klipper really did stop mid-calibration in this case (MCU shutdown, firmware restart, ...),
     * so marking any still-running entry as failed is an honest read of what happened - unlike a
     * generic Klippy reconnect/ready event, which does NOT clear results (SAVE_CONFIG restarts
     * Klipper on every successful run, and the summary should survive that expected restart).
     */
    onKlippyDisconnected({ commit, state }) {
        Object.values(state.entries)
            .filter((entry) => entry.status === 'running')
            .forEach((entry) => {
                commit('updateEntry', {
                    heaterName: entry.heaterName,
                    changes: {
                        status: 'failed',
                        finishedAt: Date.now(),
                        errorMessage: 'Klipper disconnected before the calibration finished.',
                    },
                })
            })
    },

    dismissEntry({ commit }, heaterName: string) {
        commit('removeEntry', heaterName)
    },
}
