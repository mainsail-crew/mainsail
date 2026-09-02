<template>
    <v-btn :href="href" class="primary--text logfile-btn" @click="downloadLog">
        <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
        {{ name }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiDownload } from '@mdi/js'

@Component
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiDownload = mdiDownload

    @Prop({ type: String, required: true }) name!: string

    get filename() {
        return this.name + '.log'
    }

    get href() {
        let path = '/server/files/logs/'
        if (['klippy', 'moonraker'].includes(this.name)) path = '/server/files/'

        return this.apiUrl + path + this.filename
    }

    downloadLog(event: MouseEvent) {
        event.preventDefault()

        const target = event.target as HTMLElement | null
        const href = target?.closest('a')?.href ?? ''
        if (href) window.open(href)
    }
}
</script>

<style scoped>
.logfile-btn {
    width: 100%;
    min-width: 0 !important;
}
</style>
