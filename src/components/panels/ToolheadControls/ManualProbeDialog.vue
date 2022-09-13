<template>
    <v-dialog :value="showDialog" width="600" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.ToolheadControlPanel.ManualProbe.Headline').toString()"
            :icon="mdiArrowCollapseDown"
            card-class="manual_probe-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <v-card-text>
                <v-row>
                    <v-col class="v-subheader text--secondary">
                        <span class="font-weight-bold">
                            {{ $t('Panels.ToolheadControlPanel.ManualProbe.Current') }}: {{ z_position }}
                        </span>
                        <v-spacer />
                        <span>
                            {{
                                $t('Panels.ToolheadControlPanel.ManualProbe.MinMax', {
                                    min: z_position_lower,
                                    max: z_position_upper,
                                })
                            }}
                        </span>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-item-group class="_btn-group">
                            <v-btn
                                v-for="(offset, index) in offsetsZ"
                                :key="`offsetsUp-${index}`"
                                small
                                class="_btn-qs flex-grow-1 px-1"
                                @click="sendTestZ(offset.toString())">
                                <v-icon v-if="index === 0" left small class="mr-1 ml-n1">
                                    {{ mdiArrowCollapseUp }}
                                </v-icon>
                                <span>&plus;{{ offset }}</span>
                            </v-btn>
                        </v-item-group>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col>
                        <v-item-group class="_btn-group">
                            <v-btn class="_btn-qs flex-grow-1 px-1" color="primary" @click="sendTestZ('--')">
                                <span>&minus;&minus;</span>
                            </v-btn>
                            <v-btn class="_btn-qs flex-grow-1 px-1" color="primary" @click="sendTestZ('-')">
                                <span>&minus;</span>
                            </v-btn>
                        </v-item-group>
                    </v-col>
                    <v-col></v-col>
                    <v-col>
                        <v-item-group class="_btn-group">
                            <v-btn class="_btn-qs flex-grow-1 px-1" color="primary" @click="sendTestZ('+')">
                                <span>&plus;</span>
                            </v-btn>
                            <v-btn class="_btn-qs flex-grow-1 px-1" color="primary" @click="sendTestZ('++')">
                                <span>&plus;&plus;</span>
                            </v-btn>
                        </v-item-group>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col>
                        <v-item-group class="_btn-group">
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
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="sendAbort">{{ $t('Panels.ToolheadControlPanel.ManualProbe.Abort') }}</v-btn>
                <v-btn color="primary" text @click="sendAccept">
                    {{ $t('Panels.ToolheadControlPanel.ManualProbe.Accept') }}
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

import { mdiArrowCollapseDown, mdiArrowCollapseUp, mdiInformation } from '@mdi/js'
@Component({
    components: { Panel, Responsive },
})
export default class ManualProbeDialog extends Mixins(BaseMixin) {
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiArrowCollapseUp = mdiArrowCollapseUp
    mdiInformation = mdiInformation

    get showDialog() {
        return this.$store.state.printer.manual_probe?.is_active ?? false
    }

    get offsetsZ() {
        const offsets = [...(this.$store.state.gui.control.offsetsZ ?? [])]
        const mustHaves = [0.1, 1]

        mustHaves.forEach((mustHave) => {
            if (offsets.findIndex((offset: number) => offset == mustHave) === -1) offsets.push(mustHave)
        })

        return offsets.sort()
    }

    get z_position() {
        return (this.$store.state.printer.manual_probe?.z_position ?? 0).toFixed(3)
    }

    get z_position_lower() {
        return (this.$store.state.printer.manual_probe?.z_position_lower ?? 0).toFixed(3)
    }

    get z_position_upper() {
        return (this.$store.state.printer.manual_probe?.z_position_upper ?? 0).toFixed(3)
    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    sendTestZ(offset: string) {
        const gcode = `TESTZ Z=${offset}`
        this.sendGcode(gcode)
    }

    sendAbort() {
        const gcode = `ABORT`
        this.sendGcode(gcode)
    }

    sendAccept() {
        const gcode = `ACCEPT`
        this.sendGcode(gcode)
    }
}
</script>

<style lang="scss" scoped>
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
