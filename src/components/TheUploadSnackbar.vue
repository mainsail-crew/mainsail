<template>
    <v-snackbar v-if="show" :timeout="-1" :value="true" fixed right bottom>
        <span v-if="maxNumber > 1" class="mr-1">({{ currentNumber }}/{{ maxNumber }})</span>
        <strong>{{ $t('Editor.Uploading') + ' ' + filename }}</strong>
        <br />
        {{ percent }} % @ {{ speed }}/s
        <br />
        <v-progress-linear class="mt-2" :value="percent"></v-progress-linear>
        <template #action="{ attrs }">
            <v-btn color="red" text v-bind="attrs" style="min-width: auto" @click="cancelUpload">
                <v-icon class="0">{{ mdiClose }}</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiClose } from '@mdi/js'
import { formatFilesize } from '@/plugins/helpers'

@Component({
    components: {},
})
export default class TheUploadSnackbar extends Mixins(BaseMixin) {
    mdiClose = mdiClose
    formatFilesize = formatFilesize

    get show() {
        return this.$store.state.files.upload.show ?? false
    }

    get cancelTokenSource() {
        return this.$store.state.files.upload.cancelTokenSource
    }

    get filename() {
        return this.$store.state.files.upload.filename ?? ''
    }

    get currentNumber() {
        return this.$store.state.files.upload.currentNumber ?? 0
    }

    get maxNumber() {
        return this.$store.state.files.upload.maxNumber ?? 0
    }

    get speed() {
        return formatFilesize(Math.round(this.$store.state.files.upload.speed ?? 0))
    }

    get percent() {
        return Math.round(this.$store.state.files.upload.percent ?? 0)
    }

    cancelUpload() {
        this.cancelTokenSource?.cancel()
        this.$store.dispatch('files/uploadSetShow', false)
        this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
        this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
    }

    @Watch('show')
    showChanged(newVal: boolean) {
        const body = document.getElementsByTagName('body')[0]

        if (newVal) body.classList.add('fullscreenUpload--active')
        else body.classList.remove('fullscreenUpload--active')
    }
}
</script>
