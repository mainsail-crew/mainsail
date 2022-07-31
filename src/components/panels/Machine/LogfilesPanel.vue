<template>
    <panel
        :title="$t('Machine.LogfilesPanel.Logfiles').toString()"
        :icon="mdiFileDocumentEdit"
        card-class="machine-logfiles-panel"
        :collapsible="true">
        <v-card-text :class="'text-center text-lg-left py-0'">
            <v-container pb-0 px-0>
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
                        v-if="crowsnestLog"
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
                        v-if="sonarLog && sonarLog.size > 0"
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
            </v-container>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiDownload, mdiFileDocumentEdit } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiFileDocumentEdit = mdiFileDocumentEdit
    mdiDownload = mdiDownload

    get crowsnestLog() {
        const logfiles = this.$store.getters['files/getDirectory']('logs').childrens

        return logfiles.find((log: { filename: string }) => log.filename === 'crowsnest.log')
    }

    get sonarLog() {
        const logfiles = this.$store.getters['files/getDirectory']('logs').childrens

        return logfiles.find((log: { filename: string }) => log.filename === 'sonar.log')
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
