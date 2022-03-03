<template>
    <panel
        v-if="failedComponents.length || warnings.length"
        :icon="mdiAlertCircle"
        :title="$t('Panels.MoonrakerStatePanel.MoonrakerWarnings')"
        :collapsible="true"
        card-class="moonraker-state-panel"
        toolbar-color="orange darken-2">
        <v-card-text v-if="failedComponents.length">
            <v-row>
                <v-col>
                    <p class="orange--text">{{ $t('Panels.MoonrakerStatePanel.MoonrakerErrorInfo') }}</p>
                    <p class="mb-2 orange--text">{{ $t('Panels.MoonrakerStatePanel.FollowingPluginHasAnError') }}</p>
                    <ul class="mt-0 pt-0">
                        <li v-for="component in failedComponents" :key="component" class="orange--text">
                            <code>{{ component }}</code>
                        </li>
                    </ul>
                </v-col>
            </v-row>
        </v-card-text>
        <v-divider v-if="failedComponents.length || warnings.length"></v-divider>
        <v-card-text v-for="(warning, index) in warnings" :key="warning" :class="index > 0 ? 'py-0' : 'pt-3 pb-0'">
            <v-divider v-if="index" class="my-2"></v-divider>
            <p class="orange--text mb-0">{{ warning }}</p>
        </v-card-text>
        <v-divider class="mt-3"></v-divider>
        <v-card-actions class="justify-start">
            <v-btn small :href="apiUrl + '/server/files/moonraker.log'" target="_blank" class="ml-2 primary--text">
                <v-icon class="mr-2" small>{{ mdiDownload }}</v-icon>
                {{ $t('Panels.MoonrakerStatePanel.DownloadLog') }}
            </v-btn>
        </v-card-actions>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import BaseMixin from '../mixins/base'
import { Mixins } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import { mdiAlertCircle, mdiDownload } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class MoonrakerStatePanel extends Mixins(BaseMixin) {
    mdiDownload = mdiDownload
    mdiAlertCircle = mdiAlertCircle

    get failedComponents() {
        return this.$store.state.server.failed_components ?? []
    }

    get warnings() {
        return this.$store.state.server.warnings ?? []
    }
}
</script>
