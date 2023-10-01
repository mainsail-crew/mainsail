<template>
    <v-container class="py-0">
        <v-item-group class="_btn-group py-0">
            <v-btn
                class="_btn-qs flex-grow-1 px-1"
                :disabled="isPrinting || !homedAxes.includes('xyz')"
                :loading="loadings.includes('activate_single_mode')"
                :style="{
                    'background-color': idexMode != 'copy' && idexMode != 'mirror' ? primaryColor : '',
                    color: idexMode != 'copy' && idexMode != 'mirror' ? primaryTextColor : '',
                }"
                dense
                @click="doSend('ACTIVATE_SINGLE_MODE')">
                {{ $t('Panels.ToolheadControlPanel.SingleMode') }}
            </v-btn>
            <v-btn
                class="_btn-qs flex-grow-1 px-1"
                :disabled="isPrinting || !homedAxes.includes('xyz')"
                :loading="loadings.includes('activate_copy_mode')"
                :style="{
                    'background-color': idexMode == 'copy' ? primaryColor : '',
                    color: idexMode == 'copy' ? primaryTextColor : '',
                }"
                dense
                @click="doSend('ACTIVATE_COPY_MODE')">
                {{ $t('Panels.ToolheadControlPanel.CopyMode') }}
            </v-btn>
            <v-btn
                class="_btn-qs flex-grow-1 px-1"
                :disabled="isPrinting || !homedAxes.includes('xyz')"
                :loading="loadings.includes('activate_mirror_mode')"
                :style="{
                    'background-color': idexMode == 'mirror' ? primaryColor : '',
                    color: idexMode == 'mirror' ? primaryTextColor : '',
                }"
                dense
                @click="doSend('ACTIVATE_MIRROR_MODE')">
                {{ $t('Panels.ToolheadControlPanel.MirrorMode') }}
            </v-btn>
            <v-btn
                class="_btn-qs flex-grow-1 px-1"
                :disabled="isPrinting || !homedAxes.includes('xyz') || idexMode == 'copy' || idexMode == 'mirror'"
                :loading="loadings.includes('activate_park_mode')"
                dense
                @click="doSend('ACTIVATE_PARK_MODE')">
                {{ $t('Panels.ToolheadControlPanel.Park') }}
            </v-btn>
        </v-item-group>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

@Component
export default class IdexControl extends Mixins(BaseMixin, ControlMixin) {
    get isPrinting() {
        return ['printing'].includes(this.printer_state)
    }

    get homedAxes(): string {
        return this.$store.state.printer?.toolhead?.homed_axes ?? ''
    }

    get idexMode(): string {
        return this.$store.state.printer.dual_carriage?.carriage_1?.toString().toLowerCase()
    }

    get primaryColor(): string {
        return this.$store.state.gui.uiSettings.primary
    }

    get primaryTextColor(): string {
        let splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.primaryColor)
        if (splits) {
            const r = parseInt(splits[1], 16) * 0.2126
            const g = parseInt(splits[2], 16) * 0.7152
            const b = parseInt(splits[3], 16) * 0.0722
            const perceivedLightness = (r + g + b) / 255

            return perceivedLightness > 0.7 ? '#222' : '#fff'
        }

        return '#ffffff'
    }

    doSend(gcode: string): void {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: gcode.toLowerCase() })
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
        border-color: rgba(255, 255, 255, 0.12);
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
