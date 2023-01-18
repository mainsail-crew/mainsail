<template>
    <panel
        :title="$t('Machine.LogfilesPanel.Logfiles').toString()"
        :icon="mdiFileDocumentEdit"
        card-class="machine-logfiles-panel"
        :collapsible="true">
        <template #buttons>
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <v-btn
                        icon
                        tile
                        color="primary"
                        :ripple="true"
                        :loading="loadings.includes('loadingBtnRolloverLogs')"
                        :disabled="['printing', 'paused'].includes(printer_state)"
                        v-bind="attrs"
                        v-on="on">
                        <v-icon>{{ mdiAutorenew }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('Machine.LogfilesPanel.Rollover') }}</span>
            </v-tooltip>
        </template>
        <v-card-text :class="'text-center text-lg-left'">
            <v-row>
                <v-col :class="'col-12' + (klipperState !== 'ready' ? 'col-md-6' : 'col-md-12') + ''">
                    <v-btn :href="apiUrl + '/server/files/klippy.log'" block class="primary--text" @click="downloadLog">
                        <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                        Klipper
                    </v-btn>
                </v-col>
                <v-col :class="'col-12 pt-0 ' + (klipperState !== 'ready' ? 'col-md-6 mt-md-3 ' : 'col-md-12') + ''">
                    <v-btn
                        :href="apiUrl + '/server/files/moonraker.log'"
                        block
                        class="primary--text"
                        @click="downloadLog">
                        <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                        Moonraker
                    </v-btn>
                </v-col>
                <v-col
                    v-if="existsCrowsnestLog"
                    :class="'col-12 pt-0 ' + (klipperState !== 'ready' ? 'col-md-6 mt-md-3 ' : 'col-md-12') + ''">
                    <v-btn
                        :href="apiUrl + '/server/files/logs/crowsnest.log'"
                        block
                        class="primary--text"
                        @click="downloadLog">
                        <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                        Crowsnest
                    </v-btn>
                </v-col>
                <v-col
                    v-if="existsSonarLog"
                    :class="'col-12 pt-0 ' + (klipperState !== 'ready' ? 'col-md-6 mt-md-3 ' : 'col-md-12') + ''">
                    <v-btn
                        :href="apiUrl + '/server/files/logs/sonar.log'"
                        block
                        class="primary--text"
                        @click="downloadLog">
                        <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                        Sonar
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { FileStateFile } from '@/store/files/types'
import { mdiDownload, mdiFileDocumentEdit, mdiAutorenew } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiFileDocumentEdit = mdiFileDocumentEdit
    mdiDownload = mdiDownload
    mdiAutorenew = mdiAutorenew

    get logfiles() {
        return this.$store.getters['files/getDirectory']('logs')?.childrens ?? []
    }

    get existsCrowsnestLog(): boolean {
        return this.logfiles.findIndex((log: FileStateFile) => log.filename === 'crowsnest.log') !== -1
    }

    get existsSonarLog(): boolean {
        const sonarLog = this.logfiles.find((log: FileStateFile) => log.filename === 'sonar.log')

        return sonarLog?.size > 0
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
