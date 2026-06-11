import { computed } from 'vue'
import { useStore } from 'vuex'
import { parseNumber } from '@/plugins/helpers'

export function useExtruder() {
    const store = useStore()

    const extruders = computed(() => store.getters['printer/getExtruders'])

    const activeExtruder = computed(() => store.state.printer.toolhead?.extruder)

    const activeExtruderSettings = computed(
        () => store.state.printer.configfile?.settings?.[store.state.printer.toolhead?.extruder ?? '']
    )

    const filamentDiameter = computed(() =>
        parseNumber(activeExtruderSettings.value?.filament_diameter, 1.75)
    )

    const nozzleDiameter = computed(() =>
        parseNumber(activeExtruderSettings.value?.nozzle_diameter, 0.4)
    )

    const feedamount = computed(() =>
        parseFloat(store.state.gui.control.extruder.feedamount)
    )

    const feedrate = computed(() => parseFloat(store.state.gui.control.extruder.feedrate))

    const extrudeFactor = computed(() => store.state.printer?.gcode_move?.extrude_factor ?? 1)

    const extrudePossible = computed(() => store.getters['printer/getExtrudePossible'])

    const minExtrudeTemp = computed(() =>
        parseNumber(activeExtruderSettings.value?.min_extrude_temp, 170)
    )

    return {
        extruders,
        activeExtruder,
        activeExtruderSettings,
        filamentDiameter,
        nozzleDiameter,
        feedamount,
        feedrate,
        extrudeFactor,
        extrudePossible,
        minExtrudeTemp,
    }
}
