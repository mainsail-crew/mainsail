import { computed } from 'vue'
import { useStore } from 'vuex'

export function useTimelapse() {
    const store = useStore()

    const variable_fps = computed(() => store.state.server.timelapse?.settings?.variable_fps ?? false)

    function setVariable_fps(newVal: boolean) {
        store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
    }

    const variable_fps_min = computed(
        () => store.state.server.timelapse?.settings?.variable_fps_min ?? 5
    )

    function setVariable_fps_min(newVal: number) {
        store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
    }

    const variable_fps_max = computed(
        () => store.state.server.timelapse?.settings?.variable_fps_max ?? 60
    )

    function setVariable_fps_max(newVal: number) {
        store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
    }

    const targetlength = computed(
        () => store.state.server.timelapse?.settings?.targetlength ?? 10
    )

    function setTargetlength(newVal: number) {
        store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
    }

    const output_framerate = computed(
        () => store.state.server.timelapse?.settings?.output_framerate ?? 30
    )

    function setOutput_framerate(newVal: number) {
        store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
    }

    const duplicatelastframe = computed(
        () => store.state.server.timelapse?.settings?.duplicatelastframe ?? 0
    )

    function setDuplicatelastframe(newVal: number) {
        store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
    }

    const framesCount = computed(() => store.state.server.timelapse?.lastFrame?.count ?? 0)

    const variableTargetFps = computed(() => {
        let targetFps = Math.floor(framesCount.value / targetlength.value)
        targetFps = Math.max(targetFps, variable_fps_min.value)
        targetFps = Math.min(targetFps, variable_fps_max.value)
        return targetFps
    })

    const estimatedVideoLength = computed(() => {
        let seconds = Math.round(
            (framesCount.value + duplicatelastframe.value) / output_framerate.value
        )

        if (variable_fps.value) {
            seconds = Math.round(
                (framesCount.value + duplicatelastframe.value) / variableTargetFps.value
            )
            if (seconds < targetlength.value) seconds = targetlength.value
        }

        return seconds > 60
            ? Math.floor(seconds / 60) + 'm ' + (seconds - Math.floor(seconds / 60) * 60) + 's'
            : seconds + 's'
    })

    return {
        variable_fps,
        setVariable_fps,
        variable_fps_min,
        setVariable_fps_min,
        variable_fps_max,
        setVariable_fps_max,
        targetlength,
        setTargetlength,
        output_framerate,
        setOutput_framerate,
        duplicatelastframe,
        setDuplicatelastframe,
        framesCount,
        variableTargetFps,
        estimatedVideoLength,
    }
}
