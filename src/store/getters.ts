import { GetterTree } from 'vuex'
import { RootState, RootStateDependency } from '@/store/types'
import semver from 'semver'
import { minKlipperVersion, minMoonrakerVersion } from '@/store/variables'
import i18n from '@/plugins/i18n'

// eslint-disable-next-line
export const getters: GetterTree<RootState, any> = {
    getVersion: (state) => {
        return state.packageVersion
    },

    getTitle: (state, getters) => {
        if (!state.socket?.isConnected) return 'Mainsail'
        if (state.server?.klippy_state !== 'ready') return i18n.t('App.Titles.Error')

        // get printer_state
        let printer_state = state.printer?.print_stats?.state ?? ''
        // skip pause, if timelapse is active
        if (state.printer && state.printer['gcode_macro TIMELAPSE_TAKE_FRAME']?.is_paused && printer_state === 'paused')
            printer_state = 'printing'

        // return pause title
        if (printer_state === 'paused') return i18n.t('App.Titles.Pause')

        // return complete title
        if (state.printer?.print_stats?.state === 'complete') {
            let output = i18n.t('App.Titles.Complete', {
                filename: state.printer.print_stats.filename,
            })

            // add printer name to title if it exists
            if (state.gui?.general.printername) output += `- ${state.gui?.general.printername}`

            return output
        }

        // return printing title
        if (printer_state === 'printing') {
            const eta = getters['printer/getEstimatedTimeETAFormat']
            const percent = Math.floor(getters['printer/getPrintPercent'] * 100)

            if (eta !== '--') {
                let output = i18n.t('App.Titles.PrintingETA', {
                    percent: percent,
                    filename: state.printer?.print_stats?.filename,
                    eta,
                })

                // add printer name to title if it exists
                if (state.gui?.general.printername) output += `- ${state.gui?.general.printername}`

                return output
            }

            let output = i18n.t('App.Titles.Printing', {
                percent: percent,
                filename: state.printer?.print_stats?.filename,
            })

            // add printer name to title if it exists
            if (state.gui?.general.printername) output += `- ${state.gui?.general.printername}`

            return output
        }

        return state.gui?.general.printername ?? state.printer?.hostname ?? 'Mainsail'
    },

    getDependencies: (state) => {
        const dependencies: RootStateDependency[] = []

        const klipperVersion = state.printer?.software_version ?? ''
        const klipperVersionSplits = klipperVersion.split('-')
        const klipperVersionRelease = klipperVersionSplits[0] ?? ''
        const klipperVersionBuild = parseInt(klipperVersionSplits[1] ?? 0)

        const minKlipperVersionSplits = minKlipperVersion.split('-')
        const minKlipperVersionRelease = minKlipperVersionSplits[0] ?? ''
        const minKlipperVersionBuild = parseInt(minKlipperVersionSplits[1] ?? 0)

        if (
            semver.valid(klipperVersionRelease) &&
            (semver.gt(minKlipperVersionRelease, klipperVersionRelease) ||
                (semver.eq(minKlipperVersionRelease, klipperVersionRelease) &&
                    klipperVersionBuild < minKlipperVersionBuild))
        ) {
            dependencies.push({
                serviceName: 'Klipper',
                installedVersion: klipperVersion,
                neededVersion: minKlipperVersion,
            })
        }

        const moonrakerVersion = state.server?.moonraker_version ?? ''
        const moonrakerVersionSplits = moonrakerVersion.split('-')
        const moonrakerVersionRelease = moonrakerVersionSplits[0] ?? ''
        const moonrakerVersionBuild = parseInt(moonrakerVersionSplits[1] ?? 0)

        const minMoonrakerVersionSplits = minMoonrakerVersion.split('-')
        const minMoonrakerVersionRelease = minMoonrakerVersionSplits[0] ?? ''
        const minMoonrakerVersionBuild = parseInt(minMoonrakerVersionSplits[1] ?? 0)

        if (
            semver.valid(moonrakerVersionRelease) &&
            (semver.gt(minMoonrakerVersionRelease, moonrakerVersionRelease) ||
                (semver.eq(minMoonrakerVersionRelease, moonrakerVersionRelease) &&
                    moonrakerVersionBuild < minMoonrakerVersionBuild))
        ) {
            dependencies.push({
                serviceName: 'Moonraker',
                installedVersion: moonrakerVersion,
                neededVersion: minMoonrakerVersion,
            })
        }

        return dependencies
    },
}
