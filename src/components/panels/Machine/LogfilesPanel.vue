<template>
    <panel :title="$t('Machine.LogfilesPanel.Logfiles')" icon="mdi-file-document-edit" card-class="machine-logfiles-panel" :collapsible="true">
        <v-card-text :class="'text-center text-lg-left py-0'">
            <v-container pb-0 px-0>
                <v-row>
                    <v-col :class="'col-12' +(klipperState !== 'ready' ? 'col-md-6' : 'col-md-12')+ ''">
                        <v-btn :href="this.apiUrl+'/server/files/klippy.log'" @click="downloadLog" block class="primary--text"><v-icon class="mr-2">mdi-download</v-icon>Klipper</v-btn>
                    </v-col>
                    <v-col :class="'col-12 pt-0 ' +(klipperState !== 'ready' ? 'col-md-6 mt-md-3 ' : 'col-md-12')+ ''">
                        <v-btn :href="this.apiUrl+'/server/files/moonraker.log'" @click="downloadLog" block class="primary--text"><v-icon class="mr-2">mdi-download</v-icon>Moonraker</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </panel>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {Panel}
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    downloadLog(event: any) {
        event.preventDefault()
        let href = ''
        if ('href' in event.target.attributes) href = event.target.attributes.href.value
        if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value

        window.open(href)
    }
}
</script>