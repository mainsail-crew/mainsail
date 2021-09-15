<template>
    <v-card class="mb-6" v-if="klipperReadyForGui && warnings.length">
        <v-toolbar flat dense color="orange darken-2">
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon class="mdi mdi-alert-circle" left></v-icon>{{ $t("Panels.KlipperWarningsPanel.KlipperWarnings") }} ({{ warnings.length }})
                </span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text :class="index > 0 ? 'py-0' : 'pt-3 pb-0'" v-for="(warning, index) in warnings" v-bind:key="warning">
            <v-divider class="my-2" v-if="index"></v-divider>
            <p class="orange--text mb-0" v-if="warning.type === 'deprecated_option'">{{ $t('Panels.KlipperWarningsPanel.DeprecatedOption', { section: warning.section, option: warning.option }) }}</p>
            <p class="orange--text mb-0" v-else>{{ warning.message }}</p>
        </v-card-text>
        <v-divider class="mb-2 mt-3"></v-divider>
        <v-card-actions class="px-4 pt-2 pb-4 text-center text-lg-left">
            <v-btn small :href="apiUrl+'/server/files/klipper.log'" target="_blank" color="primary" class=""><v-icon class="mr-2">mdi-download</v-icon>{{ $t("Panels.KlipperWarningsPanel.DownloadLog") }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import BaseMixin from '../mixins/base'
import {Mixins} from 'vue-property-decorator'
import {caseInsensitiveSort} from '@/plugins/helpers'

@Component
export default class KlipperWarningsPanelPanel extends Mixins(BaseMixin) {

    get warnings() {
        let warnings = this.$store.state.printer.configfile?.warnings ?? []

        return caseInsensitiveSort(warnings, 'option')
    }
}
</script>