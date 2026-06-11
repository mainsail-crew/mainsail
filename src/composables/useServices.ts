import { computed } from 'vue'
import { useStore } from 'vuex'

export function useServices() {
    const store = useStore()

    const hideOtherInstances = computed(
        () => store.state.gui.uiSettings.hideOtherInstances ?? false
    )

    const instance_ids = computed(() => store.state.server.system_info?.instance_ids ?? {})

    const klipperInstance = computed(() => instance_ids.value.klipper ?? '')

    const moonrakerInstance = computed(() => instance_ids.value.moonraker ?? '')

    return {
        hideOtherInstances,
        instance_ids,
        klipperInstance,
        moonrakerInstance,
    }
}
