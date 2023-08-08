<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="$t('ScrewsTiltAdjust.Headline')"
            :icon="mdiArrowCollapseDown"
            card-class="manual_probe-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn icon tile @click="clearScrewsTiltAdjust">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text v-if="error">
                <v-row>
                    <v-col>
                        <v-alert border="left" text type="error">{{ $t('ScrewsTiltAdjust.ErrorText') }}</v-alert>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text v-if="Object.keys(results).length">
                <template v-for="(result, name, index) of results">
                    <v-divider v-if="index" :key="`result-divider-${name}`" class="my-1" />
                    <the-screws-tilt-adjust-dialog-entry
                        :key="`result-${name}-${name}`"
                        :name="name.toString()"
                        :result="result" />
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="retryScrewsTiltAdjust">
                    {{ $t('ScrewsTiltAdjust.Retry') }}
                </v-btn>
                <v-btn color="primary" text @click="clearScrewsTiltAdjust">
                    {{ $t('ScrewsTiltAdjust.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiArrowCollapseDown, mdiCloseThick } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'
import TheScrewsTiltAdjustDialogEntry from '@/components/dialogs/TheScrewsTiltAdjustDialogEntry.vue'
@Component({
    components: { TheScrewsTiltAdjustDialogEntry, Panel, Responsive, SettingsRow },
})
export default class TheScrewsTiltAdjustDialog extends Mixins(BaseMixin, ControlMixin) {
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiCloseThick = mdiCloseThick

    get state() {
        return this.$store.state.printer.screws_tilt_adjust ?? {}
    }

    get error() {
        return this.$store.state.printer.screws_tilt_adjust?.error ?? false
    }

    get max_deviation() {
        return this.$store.state.printer.screws_tilt_adjust?.max_deviation ?? null
    }

    get results() {
        return this.$store.state.printer.screws_tilt_adjust?.results ?? {}
    }

    get showDialog() {
        // don't display the dialog, if the user disabled it in the UI settings
        if (!this.boolScrewsTiltAdjustDialog) return false

        // don't display the dialog, if the user add the MAX_DEVIATION attribute to the SCREWS_TILT_CALCULATE command
        if (this.max_deviation !== null) return false

        return this.error || Object.keys(this.results).length
    }

    get boolScrewsTiltAdjustDialog() {
        return this.$store.state.gui.uiSettings.boolScrewsTiltAdjustDialog ?? true
    }

    clearScrewsTiltAdjust() {
        this.$store.dispatch('printer/clearScrewsTiltAdjust')
    }

    async retryScrewsTiltAdjust() {
        await this.$store.dispatch('printer/clearScrewsTiltAdjust')

        this.doSend('SCREWS_TILT_CALCULATE')
    }
}
</script>
