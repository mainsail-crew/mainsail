<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="$t('ScrewsTiltAdjust.Headline').toString()"
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
            <v-card-text v-if="results.length">
                <template v-for="(result, index) of results">
                    <v-divider v-if="index" :key="`result-divider-` + index" class="my-1" />
                    <the-screws-tilt-adjust-dialog-entry :key="`result-` + index" :result="result" />
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
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
        return this.state.error ?? false
    }

    get results() {
        return this.state.results ?? []
    }

    get showDialog() {
        return this.error || this.results.length
    }

    clearScrewsTiltAdjust() {
        this.$store.dispatch('printer/clearScrewsTiltAdjust')
    }
}
</script>

<style lang="scss" scoped></style>
