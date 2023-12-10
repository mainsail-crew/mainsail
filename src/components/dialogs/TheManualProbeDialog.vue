<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="$t('ManualProbe.Headline').toString()"
            :icon="mdiArrowCollapseDown"
            card-class="manual_probe-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn icon tile @click="sendAbort">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-container>
                <v-row>
                    <v-col class="d-flex align-center justify-center">
                        <span class="text-h5">{{ z_position_lower }}</span>
                        <v-icon class="mx-2">{{ mdiChevronTripleRight }}</v-icon>
                        <span class="text-h4">{{ z_position }}</span>
                        <v-icon class="mx-2">{{ mdiChevronTripleLeft }}</v-icon>
                        <span class="text-h5">{{ z_position_upper }}</span>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="text-left">
                        <v-btn class="" color="primary" @click="sendTestZ('--')">
                            <v-icon small>{{ mdiMinusThick }}</v-icon>
                            <v-icon small>{{ mdiMinusThick }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col class="text-left">
                        <v-btn class="" color="primary" @click="sendTestZ('-')">
                            <v-icon small>{{ mdiMinusThick }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col class="text-right">
                        <v-btn class="" color="primary" @click="sendTestZ('+')">
                            <v-icon small>{{ mdiPlusThick }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col class="text-right">
                        <v-btn class="" color="primary" @click="sendTestZ('++')">
                            <v-icon small>{{ mdiPlusThick }}</v-icon>
                            <v-icon small>{{ mdiPlusThick }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
            <sub-panel :title="$t('ManualProbe.Advanced')" sub-panel-class="manual-probe-dialog-advanced" class="mb-n2">
                <v-container>
                    <v-item-group class="_btn-group">
                        <v-btn
                            v-for="(offset, index) in offsetsZ"
                            :key="`offsetsUp-${index}`"
                            small
                            class="_btn-qs flex-grow-1 px-1"
                            @click="sendTestZ(offset.toString())">
                            <v-icon v-if="index === 0" left small class="mr-1 ml-n1">
                                {{ mdiArrowExpandUp }}
                            </v-icon>
                            <span>&plus;{{ offset }}</span>
                        </v-btn>
                    </v-item-group>
                    <v-item-group class="_btn-group mt-6 mt-sm-3">
                        <v-btn
                            v-for="(offset, index) in offsetsZ"
                            :key="`offsetsDown-${index}`"
                            small
                            class="_btn-qs flex-grow-1 px-1"
                            @click="sendTestZ((offset * -1).toString())">
                            <v-icon v-if="index === 0" left small class="mr-1 ml-n1">
                                {{ mdiArrowCollapseDown }}
                            </v-icon>
                            <span>&minus;{{ offset }}</span>
                        </v-btn>
                    </v-item-group>
                </v-container>
            </sub-panel>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text :loading="loadingAbort" @click="sendAbort">
                    {{ $t('ManualProbe.Abort') }}
                </v-btn>
                <v-btn color="primary" text :loading="loadingAccept" @click="sendAccept">
                    {{ $t('ManualProbe.Accept') }}
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

import {
    mdiArrowCollapseDown,
    mdiArrowExpandUp,
    mdiInformation,
    mdiPlusThick,
    mdiMinusThick,
    mdiChevronTripleLeft,
    mdiChevronTripleRight,
    mdiCloseThick,
} from '@mdi/js'
@Component({
    components: { Panel, Responsive },
})
export default class TheManualProbeDialog extends Mixins(BaseMixin) {
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiArrowExpandUp = mdiArrowExpandUp
    mdiInformation = mdiInformation
    mdiPlusThick = mdiPlusThick
    mdiMinusThick = mdiMinusThick
    mdiChevronTripleLeft = mdiChevronTripleLeft
    mdiChevronTripleRight = mdiChevronTripleRight
    mdiCloseThick = mdiCloseThick

    get showDialog() {
        if (!this.boolManualProbeDialog) return false

        return this.$store.state.printer.manual_probe?.is_active ?? false
    }

    get boolManualProbeDialog() {
        return this.$store.state.gui.uiSettings.boolManualProbeDialog ?? true
    }

    get offsetsZ() {
        const offsets = [1, 0.1, 0.05, 0.01, 0.005]

        return offsets.sort()
    }

    get z_position() {
        return (this.$store.state.printer.manual_probe?.z_position ?? 0).toFixed(3)
    }

    get z_position_lower() {
        const value = this.$store.state.printer.manual_probe?.z_position_lower ?? null
        if (value === null) return '??????'

        return value.toFixed(3)
    }

    get z_position_upper() {
        const value = this.$store.state.printer.manual_probe?.z_position_upper ?? null
        if (value === null) return '??????'

        return value.toFixed(3)
    }

    get loadingAbort() {
        return this.loadings.includes('manualProbeAbort')
    }

    get loadingAccept() {
        return this.loadings.includes('manualProbeAccept')
    }

    sendTestZ(offset: string) {
        const gcode = `TESTZ Z=${offset}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    sendAbort() {
        const gcode = `ABORT`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAbort' })
    }

    sendAccept() {
        const gcode = `ACCEPT`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAccept' })
    }
}
</script>

<style scoped>
.v-btn-toggle {
    width: 100%;
}

._btn-group {
    border-radius: 4px;
    display: inline-flex;
    flex-wrap: nowrap;
    max-width: 100%;
    min-width: 100%;
    width: 100%;

    .v-btn {
        border-radius: 0;
        border-color: rgba(255, 255, 255, 0.12) !important;
        border-style: solid;
        border-width: thin;
        box-shadow: none;
        height: 28px;
        opacity: 0.8;
        min-width: auto !important;
    }

    .v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .v-btn:not(:first-child) {
        border-left-width: 0;
    }
}

._btn-qs {
    font-size: 0.8rem !important;
    font-weight: 400;
    max-height: 28px;
}
</style>
