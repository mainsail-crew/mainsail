<template>
    <div>
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
                            v-on="on"
                            @click="showRolloverDialog = true">
                            <v-icon>{{ mdiFileSyncOutline }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Machine.LogfilesPanel.Rollover') }}</span>
                </v-tooltip>
            </template>
            <v-card-text :class="'text-center text-lg-left'">
                <v-row>
                    <v-col :class="'col-12' + (klipperState !== 'ready' ? 'col-md-6' : 'col-md-12') + ''">
                        <v-btn
                            :href="apiUrl + '/server/files/klippy.log'"
                            block
                            class="primary--text"
                            @click="downloadLog">
                            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                            Klipper
                        </v-btn>
                    </v-col>
                    <v-col
                        :class="'col-12 pt-0 ' + (klipperState !== 'ready' ? 'col-md-6 mt-md-3 ' : 'col-md-12') + ''">
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
        <v-dialog :value="showRolloverDialog" persistent width="400" :fullscreen="isMobile">
            <panel
                :title="$t('Machine.LogfilesPanel.Rollover').toString()"
                card-class="machine_rollover_logfiles-dialog"
                :icon="mdiFileSyncOutline"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="showRolloverDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Machine.LogfilesPanel.RolloverDescription') }}</p>
                        </v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col>
                            <v-checkbox
                                v-for="log in rolloverLogfiles"
                                :key="log"
                                v-model="selectedRolloverLogs"
                                :label="capitalize(log)"
                                :value="log"
                                hide-details
                                class="mt-0" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="btnRolloverLogs">
                        {{ $t('Machine.LogfilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text @click="btnRolloverLogs">
                        {{ $t('Machine.LogfilesPanel.Accept') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { FileStateFile } from '@/store/files/types'
import { mdiDownload, mdiFileDocumentEdit, mdiCloseThick, mdiFileSyncOutline } from '@mdi/js'
import { rolloverLogfiles } from '@/store/variables'
import { capitalize } from '@/plugins/helpers'
@Component({
    components: { Panel },
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiFileDocumentEdit = mdiFileDocumentEdit
    mdiDownload = mdiDownload
    mdiCloseThick = mdiCloseThick
    mdiFileSyncOutline = mdiFileSyncOutline

    rolloverLogfiles = rolloverLogfiles
    capitalize = capitalize

    private showRolloverDialog = false
    private selectedRolloverLogs: string[] = []

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

    get loadingRolloverLogs() {
        return this.loadings.filter((log) => log.startsWith('rolloverLog_')).length > 0
    }

    downloadLog(event: any) {
        event.preventDefault()
        let href = ''
        if ('href' in event.target.attributes) href = event.target.attributes.href.value
        if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value

        window.open(href)
    }

    btnRolloverLogs() {
        if (this.selectedRolloverLogs.length === 0) return

        this.selectedRolloverLogs.forEach((name) => {
            this.$socket.emit(
                'server.logs.rollover',
                { application: name },
                { loading: 'rolloverLog_' + name, action: 'files/rolloverLog' }
            )
        })

        this.selectedRolloverLogs = []
    }

    @Watch('loadingRolloverLogs')
    loadingRolloverLogsChanged(newVal: boolean) {
        if (newVal) this.showRolloverDialog = false
    }
}
</script>
