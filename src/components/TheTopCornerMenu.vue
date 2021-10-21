<style scoped>
    .minheight30 {
        min-height: 30px;
    }
</style>

<template>
    <div>
        <v-menu bottom left :offset-y="true" :close-on-content-click="false" v-model="showMenu">
            <template v-slot:activator="{ on, attrs }">
                <v-btn color="grey darken-3" v-bind="attrs" v-on="on" class="ml-5 minwidth-0 px-2">
                    <v-icon>mdi-power-standby</v-icon>
                </v-btn>
            </template>
            <v-list dense>
                <v-subheader class="" style="height: auto;">{{ $t("App.TopCornerMenu.KlipperControl") }}</v-subheader>
                <v-list-item class="minheight30" link @click="klipperRestart()">
                    <v-list-item-title><v-icon class="mr-2" small>mdi-restart</v-icon>{{ $t("App.TopCornerMenu.KlipperRestart") }}</v-list-item-title>
                </v-list-item>
                <v-list-item class="minheight30" link @click="klipperFirmwareRestart()">
                    <v-list-item-title><v-icon class="mr-2" small>mdi-restart</v-icon>{{ $t("App.TopCornerMenu.KlipperFirmwareRestart") }}</v-list-item-title>
                </v-list-item>
                <template v-if="services.length">
                    <v-divider class="mt-0"></v-divider>
                    <v-subheader class="pt-2" style="height: auto;">{{ $t("App.TopCornerMenu.RestartServices") }}</v-subheader>
                    <v-list-item class="minheight30"  link @click="serviceRestart(service)" v-for="service in services" v-bind:key="service">
                        <v-list-item-title><v-icon class="mr-2" small>mdi-restart</v-icon>{{ service.charAt(0).toUpperCase() + service.slice(1) }}</v-list-item-title>
                    </v-list-item>
                </template>
                <template v-if="powerDevices.length">
                    <v-divider class="mt-0"></v-divider>
                    <v-subheader class="pt-2" style="height: auto;">{{ $t("App.TopCornerMenu.PowerDevices") }}</v-subheader>
                    <v-list-item v-for="(device, index) in powerDevices" v-bind:key="index" class="minheight30" @click="changeSwitch(device, device.status)" :disabled="(device.status === 'error' || device.locked_while_printing && ['printing', 'paused'].includes(printer_state))">
                        <v-list-item-title>
                            <v-icon class="mr-2" :color="device.status === 'on' ? '' : 'grey darken-2'">mdi-{{ device.status === 'on' ? 'toggle-switch' : 'toggle-switch-off' }}</v-icon>{{ device.device }}
                        </v-list-item-title>
                    </v-list-item>
                </template>
                <v-divider class="mt-0"></v-divider>
                <v-subheader class="pt-2" style="height: auto;">{{ $t("App.TopCornerMenu.HostControl") }}</v-subheader>
                <v-list-item class="minheight30" link @click="hostReboot()">
                    <v-list-item-title><v-icon class="mr-2" small>mdi-power</v-icon>{{ $t("App.TopCornerMenu.Reboot") }}</v-list-item-title>
                </v-list-item>
                <v-list-item class="minheight30" link @click="hostShutdown()">
                    <v-list-item-title><v-icon class="mr-2" small>mdi-power</v-icon>{{ $t("App.TopCornerMenu.Shutdown") }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogPowerDeviceChange.show" width="400" :fullscreen="isMobile">
            <v-card>
                <v-card-title class="headline">{{ $t(this.dialogPowerDeviceChange.value === 'off' ? 'PowerDeviceChangeDialog.TurnDeviceOn' : 'PowerDeviceChangeDialog.TurnDeviceOff', {'device': dialogPowerDeviceChange.device}) }}</v-card-title>
                <v-card-text>{{ $t('PowerDeviceChangeDialog.AreYouSure') }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="dialogPowerDeviceChange.show = false">{{ $t('PowerDeviceChangeDialog.No')}}</v-btn>
                    <v-btn color="green darken-1" text @click="powerDeviceToggle">{{$t('PowerDeviceChangeDialog.Yes')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {ServerPowerStateDevice} from '@/store/server/power/types'

interface dialogPowerDeviceChange {
    show: boolean
    device: string
    value: string
}

@Component
export default class TheTopCornerMenu extends Mixins(BaseMixin) {
    showMenu = false
    dialogPowerDeviceChange : dialogPowerDeviceChange = {
        show: false,
        device: '',
        value: ''
    }

    get services() {
        const services = this.$store.state.server.system_info?.available_services?.filter((name: string) => name !== 'klipper_mcu') ?? []
        services.sort()
        return services
    }

    get powerDevices() {
        return this.$store.getters['server/power/getDevices']
    }

    klipperRestart() {
        this.showMenu = false
        this.$store.dispatch('server/addEvent', { message: 'RESTART', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'RESTART' })
    }

    klipperFirmwareRestart() {
        this.showMenu = false
        this.$store.dispatch('server/addEvent', { message: 'FIRMWARE_RESTART', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'FIRMWARE_RESTART' })
    }

    serviceRestart(service: string) {
        this.showMenu = false
        this.$socket.emit('machine.services.restart', { service: service })
    }

    changeSwitch(device: ServerPowerStateDevice, value: string) {
        this.dialogPowerDeviceChange.device = device.device
        this.dialogPowerDeviceChange.value = value

        const confirmOnPowerDeviceChange = this.$store.state.gui.general.confirmOnPowerDeviceChange
        if (confirmOnPowerDeviceChange) {
            this.dialogPowerDeviceChange.show = true
        }
        else {
            this.powerDeviceToggle()
        }
    }

    powerDeviceToggle() {
        this.dialogPowerDeviceChange.show = false
        const rpc = (this.dialogPowerDeviceChange.value === 'off' ? 'machine.device_power.on' : 'machine.device_power.off')
        this.$socket.emit(rpc,{ [this.dialogPowerDeviceChange.device]: null },{ action: 'server/power/responseToggle' })
    }

    hostReboot() {
        this.showMenu = false
        this.$socket.emit('machine.reboot', { })
    }

    hostShutdown() {
        this.showMenu = false
        this.$socket.emit('machine.shutdown', { })
    }
}
</script>