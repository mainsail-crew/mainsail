import { computed } from 'vue'
import { useStore } from 'vuex'
import { GuiConsoleStateFilter } from '@/store/gui/console/types'

export function useConsole() {
    const store = useStore()

    const helplist = computed(() => {
        const commands: { [key: string]: { help?: string } } =
            store.state.printer.gcode?.commands ?? {}
        const helplist: { command: string; help: string }[] = []

        for (const [key, values] of Object.entries(commands)) {
            helplist.push({ command: key, help: values.help ?? '' })
        }

        return helplist
    })

    const consoleDirection = computed(() => store.state.gui.console.direction ?? 'table')

    const hideWaitTemperatures = computed(() => store.state.gui.console.hideWaitTemperatures)

    function setHideWaitTemperatures(newVal: boolean) {
        store.dispatch('gui/saveSetting', { name: 'console.hideWaitTemperatures', value: newVal })
    }

    const hideTlCommands = computed(() => store.state.gui.console.hideTlCommands)

    function setHideTlCommands(newVal: boolean) {
        store.dispatch('gui/saveSetting', { name: 'console.hideTlCommands', value: newVal })
    }

    const customFilters = computed(() => store.state.gui.console.consolefilters ?? {})

    const autoscroll = computed(() => store.state.gui.console.autoscroll ?? true)

    function setAutoscroll(newVal: boolean) {
        store.dispatch('gui/saveSetting', { name: 'console.autoscroll', value: newVal })
    }

    const rawOutput = computed(() => store.state.gui.console.rawOutput ?? false)

    function setRawOutput(newVal: boolean) {
        store.dispatch('gui/saveSetting', { name: 'console.rawOutput', value: newVal })
    }

    const lastCommands = computed(() => store.state.gui.gcodehistory.entries ?? [])

    function toggleFilter(id: string | number, filter: GuiConsoleStateFilter): void {
        store.dispatch('gui/console/filterUpdate', { id, values: filter })
    }

    function clearConsole() {
        store.dispatch('gui/console/clear')
    }

    return {
        helplist,
        consoleDirection,
        hideWaitTemperatures,
        setHideWaitTemperatures,
        hideTlCommands,
        setHideTlCommands,
        customFilters,
        autoscroll,
        setAutoscroll,
        rawOutput,
        setRawOutput,
        lastCommands,
        toggleFilter,
        clearConsole,
    }
}
