<template>
    <panel
        v-if="klipperReadyForGui && warnings.length"
        :icon="mdiAlertCircle"
        :title="$t('Panels.KlipperWarningsPanel.KlipperWarnings') + ' (' + warnings.length + ')'"
        :collapsible="true"
        card-class="klipper-warnings-panel"
        toolbar-color="orange darken-2">
        <v-card-text v-for="(warning, index) in warnings" :key="index" :class="index > 0 ? 'py-0' : 'pt-3 pb-0'">
            <v-divider v-if="index" class="my-2"></v-divider>
            <v-row>
                <v-col>
                    <p v-if="warning.type === 'deprecated_option'" class="orange--text mb-0">
                        {{
                            $t('Panels.KlipperWarningsPanel.DeprecatedOption', {
                                section: warning.section,
                                option: warning.option,
                            })
                        }}
                    </p>
                    <p v-else-if="warning.type === 'deprecated_value'" class="orange--text mb-0">
                        {{
                            $t('Panels.KlipperWarningsPanel.DeprecatedValue', {
                                section: warning.section,
                                option: warning.option,
                                value: warning.value,
                            })
                        }}
                    </p>
                    <p v-else class="orange--text mb-0">{{ warning.message }}</p>
                </v-col>
                <v-col class="col-auto d-flex align-center">
                    <a :href="getDocsLink(warning)" target="_blank" class="text-decoration-none">
                        <v-icon>{{ mdiInformation }}</v-icon>
                    </a>
                </v-col>
            </v-row>
        </v-card-text>
        <v-divider class="mt-3"></v-divider>
        <v-card-actions class="justify-start">
            <v-btn small :href="apiUrl + '/server/files/klipper.log'" target="_blank" class="ml-2 primary--text">
                <v-icon class="mr-2" small>{{ mdiDownload }}</v-icon>
                {{ $t('Panels.KlipperWarningsPanel.DownloadLog') }}
            </v-btn>
        </v-card-actions>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import BaseMixin from '../mixins/base'
import { Mixins } from 'vue-property-decorator'
import { caseInsensitiveSort } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import { mdiAlertCircle, mdiDownload, mdiInformation } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class KlipperWarningsPanelPanel extends Mixins(BaseMixin) {
    mdiAlertCircle = mdiAlertCircle
    mdiInformation = mdiInformation
    mdiDownload = mdiDownload

    get warnings() {
        let warnings = this.$store.state.printer.configfile?.warnings ?? []

        return caseInsensitiveSort(warnings, 'option')
    }

    getDocsLink(warning: { type: string; option: string; value: string }) {
        let url = 'https://docs.mainsail.xyz/faq/klipper_warnings/' + warning.type

        if (warning.type === 'deprecated_option' && warning.option.startsWith('default_parameter'))
            url += '#default_parameter'
        else if (warning.type === 'deprecated_option') url += '#' + warning.option
        else if (warning.type === 'deprecated_value') url += '#' + warning.value

        return url
    }
}
</script>
