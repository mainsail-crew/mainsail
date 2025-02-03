import Component from 'vue-class-component'
import Vue from 'vue'

@Component
export default class TimelapseMixin extends Vue {
    get variable_fps() {
        return this.$store.state.server.timelapse?.settings?.variable_fps ?? false
    }

    set variable_fps(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
    }

    get variable_fps_min() {
        return this.$store.state.server.timelapse?.settings?.variable_fps_min ?? 5
    }

    set variable_fps_min(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
    }

    get variable_fps_max() {
        return this.$store.state.server.timelapse?.settings?.variable_fps_max ?? 60
    }

    set variable_fps_max(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
    }

    get targetlength() {
        return this.$store.state.server.timelapse?.settings?.targetlength ?? 10
    }

    set targetlength(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
    }

    get output_framerate() {
        return this.$store.state.server.timelapse?.settings?.output_framerate ?? 30
    }

    set output_framerate(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
    }

    get duplicatelastframe() {
        return this.$store.state.server.timelapse?.settings?.duplicatelastframe ?? 0
    }

    set duplicatelastframe(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
    }

    get framesCount() {
        return this.$store.state.server.timelapse?.lastFrame?.count ?? 0
    }

    get estimatedVideoLength() {
        let seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.output_framerate)

        if (this.variable_fps) {
            seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.variableTargetFps)
            if (seconds < this.targetlength) seconds = this.targetlength
        }

        return seconds > 60
            ? Math.floor(seconds / 60) + 'm ' + (seconds - Math.floor(seconds / 60) * 60) + 's'
            : seconds + 's'
    }

    get variableTargetFps() {
        let targetFps = Math.floor(this.framesCount / this.targetlength)
        targetFps = Math.max(targetFps, this.variable_fps_min)
        targetFps = Math.min(targetFps, this.variable_fps_max)

        return targetFps
    }
}
