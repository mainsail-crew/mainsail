<style scoped>

</style>

<template>
    <div>
        <v-snackbar v-model="boolShowDialogRunning" :timeout="-1" :value="true" fixed right bottom dark>
            <div>
                {{ $t('Timelapse.TimelapseRendering') }}...
            </div>
            <v-progress-linear class="mt-2" v-if="progress > 0" :value="progress" indeterminate></v-progress-linear>
            <v-progress-linear class="mt-2" v-if="progress === 0" indeterminate></v-progress-linear>
        </v-snackbar>
        <v-snackbar v-model="boolShowDialogSuccess" :timeout="5000" :value="true" fixed right bottom dark>
            <div>
                {{ $t('Timelapse.TimelapseRenderingSuccessful') }}<br />
                <strong>{{ filename }}</strong>
            </div>
        </v-snackbar>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({
    components: {
    }
})
export default class TheTimelapseRenderingSnackbar extends Mixins(BaseMixin) {

    get boolShowDialogRunning() {
        return (this.status === 'running')
    }

    get boolShowDialogSuccess() {
        return (this.status === 'success')
    }

    set boolShowDialogSuccess(newVal) {
        if (!newVal) this.$store.dispatch('server/timelapse/resetSnackbar')
    }

    get status() {
        return this.$store.state.server.timelapse.rendering.status ?? ''
    }

    get progress() {
        return this.$store.state.server.timelapse.rendering.progress ?? ''
    }

    get filename() {
        return this.$store.state.server.timelapse.rendering.filename ?? ''
    }
}
</script>