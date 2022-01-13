import { GetterTree } from 'vuex'
import {RootState, RootStateDependency} from '@/store/types'
import semver from 'semver'
import {minKlipperVersion, minMoonrakerVersion} from '@/store/variables'
import i18n from '@/plugins/i18n'

// eslint-disable-next-line
export const getters: GetterTree<RootState, any> = {
    getVersion: state => {
        return state.packageVersion
    },

    getTitle: (state, getters) => {
        if (state.socket?.isConnected && state.printer) {
            let printer_state = state.printer?.print_stats?.state ?? ''

            if (state.printer['gcode_macro TIMELAPSE_TAKE_FRAME']?.is_paused && printer_state === 'paused')
                printer_state = 'printing'

            if (state.server?.klippy_state !== 'ready') return i18n.t('App.Titles.Error')
            else if (printer_state === 'paused') return i18n.t('App.Titles.Pause')
            else if (printer_state === 'printing') {
                const eta = getters['printer/getEstimatedTimeETA']

                if (eta) {
                    const date = new Date(eta)
                    const h = date.getHours() >= 10 ? date.getHours() : '0'+date.getHours()
                    const m = date.getMinutes() >= 10 ? date.getMinutes() : '0'+date.getMinutes()
                    const diff = eta - new Date().getTime()

                    return i18n.t('App.Titles.PrintingETA', {
                        percent: (getters['printer/getPrintPercent'] * 100).toFixed(0),
                        filename: state.printer.print_stats?.filename,
                        eta: h+':'+m+((diff > 60*60*24*1000) ? '+'+(diff / (60*60*24*1000)).toFixed() : '')
                    })
                } else return i18n.t('App.Titles.Printing', {
                    percent: (getters['printer/getPrintPercent'] * 100).toFixed(0),
                    filename: state.printer.print_stats?.filename,
                })
            } else if (state.printer?.print_stats?.state === 'complete') return i18n.t('App.Titles.Complete', { filename: state.printer.print_stats.filename })

            return state.gui?.general.printername ?? state.printer?.hostname ?? 'Mainsail'
        }

        return 'Mainsail'
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
            semver.valid(klipperVersionRelease) && (
                semver.gt(minKlipperVersionRelease, klipperVersionRelease) ||
                (semver.eq(minKlipperVersionRelease, klipperVersionRelease) && klipperVersionBuild < minKlipperVersionBuild)
            )
        ) {
            dependencies.push({
                serviceName: 'Klipper',
                installedVersion: klipperVersion,
                neededVersion: minKlipperVersion
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
            semver.valid(moonrakerVersionRelease) && (
                semver.gt(minMoonrakerVersionRelease, moonrakerVersionRelease) ||
                (semver.eq(minMoonrakerVersionRelease, moonrakerVersionRelease) && moonrakerVersionBuild < minMoonrakerVersionBuild)
            )
        ) {
            dependencies.push({
                serviceName: 'Moonraker',
                installedVersion: moonrakerVersion,
                neededVersion: minMoonrakerVersion
            })
        }

        return dependencies
    }
}
