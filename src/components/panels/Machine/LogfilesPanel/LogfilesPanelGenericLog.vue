<template>
    <v-col v-if="exists" :class="classes">
        <v-btn :href="href" block class="primary--text" @click="downloadLog">
            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
            {{ name }}
        </v-btn>
    </v-col>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { FileStateFile } from '@/store/files/types'
import { mdiDownload } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiDownload = mdiDownload

    @Prop({ type: String, required: true }) name!: string

    get logfiles() {
        return this.$store.getters['files/getDirectory']('logs')?.childrens ?? []
    }

    get filename() {
        return this.name + '.log'
    }

    get exists(): boolean {
        if (['klippy', 'moonraker'].includes(this.name)) return true

        return this.logfiles.findIndex((log: FileStateFile) => log.filename === this.filename) !== -1
    }

    get href() {
        let path = '/server/files/logs/'
        if (['klippy', 'moonraker'].includes(this.name)) path = '/server/files/'

        return this.apiUrl + path + this.filename
    }

    get classes() {
        const output = ['col-12', 'pt-0']

        if (this.klipperState !== 'ready') {
            output.push('col-md-6')
            output.push('mt-md-3')
        } else {
            output.push('col-md-12')
        }

        return output
    }

    downloadLog(event: any) {
        event.preventDefault()
        let href = ''
        if ('href' in event.target.attributes) href = event.target.attributes.href.value
        if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value

        window.open(href)
    }
}
</script>
