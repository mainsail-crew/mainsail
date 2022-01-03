<style scoped>
    .minheight30 {
        min-height: 30px;
    }
</style>

<template>
    <div>
        <v-menu bottom left :offset-y="true" :close-on-content-click="false" v-model="showMenu">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon>mdi-power-standby</v-icon>
                </v-btn>
            </template>
            <v-list dense>
                <template v-if="klipperState !== 'disconnected'">
                    <v-subheader class="" style="height: auto;">{{ $t("App.TopCornerMenu.KlipperControl") }}</v-subheader>
                    <v-list-item class="minheight30 pr-2" link @click="checkDialog(klipperRestart)">
                        <v-list-item-title>{{ $t("App.TopCornerMenu.KlipperRestart") }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto;">
                            <v-icon class="mr-2" small>mdi-restart</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item class="minheight30 pr-2" link @click="checkDialog(klipperFirmwareRestart)">
                        <v-list-item-title>{{ $t("App.TopCornerMenu.KlipperFirmwareRestart") }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto;">
                            <v-icon class="mr-2" small>mdi-restart</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <template v-if="services.length">
                    <v-divider class="mt-0" v-if="klipperState !== 'disconnected'"></v-divider>
                    <v-subheader class="pt-2" style="height: auto;">{{ $t("App.TopCornerMenu.ServiceControl") }}</v-subheader>
                    <v-list-item class="minheight30 pr-2" v-for="service in services" v-bind:key="service">
                        <v-list-item-title>
                            <v-tooltip left>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">{{ service.charAt(0).toUpperCase() + service.slice(1) }}</span>
                                </template>
                                <span>{{ getServiceState(service) }} ({{ getServiceSubState(service) }})</span>
                            </v-tooltip>
                        </v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto;">
                            <v-btn icon small v-if="getServiceState(service) === 'inactive'" @click="checkDialog(serviceStart, service)"><v-icon small>mdi-play</v-icon></v-btn>
                            <v-btn icon small v-else @click="checkDialog(serviceRestart, service)"><v-icon small>mdi-restart</v-icon></v-btn>
                            <v-btn icon small :disabled="getServiceState(service) === 'inactive' || service === 'moonraker'" @click="checkDialog(serviceStop, service)" :style="service === 'moonraker' ? 'visibility: hidden;' : ''"><v-icon small>mdi-stop</v-icon></v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <template v-if="powerDevices.length">
                    <v-divider class="mt-0"></v-divider>
                    <v-subheader class="pt-2" style="height: auto;">{{ $t("App.TopCornerMenu.PowerDevices") }}</v-subheader>
                    <v-list-item v-for="(device, index) in powerDevices" v-bind:key="index" class="minheight30 pr-2" @click="changeSwitch(device, device.status)" :disabled="(device.status === 'error' || device.locked_while_printing && ['printing', 'paused'].includes(printer_state))">
                        <v-list-item-title>{{ device.device }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto;">
                            <v-icon class="mr-2" :color="device.status === 'on' ? '' : 'grey darken-2'">mdi-{{ device.status === 'on' ? 'toggle-switch' : 'toggle-switch-off' }}</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <v-divider class="mt-0"></v-divider>
                <v-subheader class="pt-2" style="height: auto;">{{ $t("App.TopCornerMenu.HostControl") }}</v-subheader>
                <v-list-item class="minheight30 pr-2" link @click="checkDialog(hostReboot)">
                    <v-list-item-title>{{ $t("App.TopCornerMenu.Reboot") }}</v-list-item-title>
                    <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto;">
                        <v-icon class="mr-2" small>mdi-power</v-icon>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item class="minheight30 pr-2" link @click="checkDialog(hostShutdown)">
                    <v-list-item-title>{{ $t("App.TopCornerMenu.Shutdown") }}</v-list-item-title>
                    <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto;">
                        <v-icon class="mr-2" small>mdi-power</v-icon>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogPowerDeviceChange.show" width="400" :fullscreen="isMobile">
            <v-card>
                <v-card-title class="headline">{{ this.dialogPowerDeviceChange.value === 'off' ? $t('PowerDeviceChangeDialog.TurnDeviceOn', {'device': dialogPowerDeviceChange.device}) : $t('PowerDeviceChangeDialog.TurnDeviceOff', {'device': dialogPowerDeviceChange.device}) }}</v-card-title>
                <v-card-text>{{ $t('PowerDeviceChangeDialog.AreYouSure') }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="dialogPowerDeviceChange.show = false">{{ $t('PowerDeviceChangeDialog.No')}}</v-btn>
                    <v-btn color="green darken-1" text @click="powerDeviceToggle">{{$t('PowerDeviceChangeDialog.Yes')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogConfirmation.show" width="400" :fullscreen="isMobile">
            <panel card-class="confirm-top-corner-menu-dialog" icon="mdi-alert" :title="dialogConfirmation.title" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogConfirmation.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="pt-3">
                    <v-row>
                        <v-col>
                            <p class="body-2">{{ dialogConfirmation.description }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="dialogConfirmation.show = false">
                        {{ $t('App.TopCornerMenu.Cancel') }}
                    </v-btn>
                    <v-btn text color="error" @click="executeDialog">
                        {{ dialogConfirmation.actionButtonText }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {ServerPowerStateDevice} from '@/store/server/power/types'
import Panel from '@/components/ui/Panel.vue'

interface dialogPowerDeviceChange {
    show: boolean
    device: string
    value: string
}

interface dialogConfirmation {
    show: boolean
    serviceName: string | null
    executableFunction: any | null
    title: string
    description: string
    actionButtonText: string
}

@Component({
    components: {Panel}
})
export default class TheTopCornerMenu extends Mixins(BaseMixin) {

    showMenu = false
    dialogPowerDeviceChange : dialogPowerDeviceChange = {
        show: false,
        device: '',
        value: ''
    }

    dialogConfirmation: dialogConfirmation = {
        show: false,
        serviceName: null,
        executableFunction: null,
        title: '',
        description: '',
        actionButtonText: ''
    }

    get services() {
        const services = this.$store.state.server.system_info?.available_services?.filter((name: string) => name !== 'klipper_mcu') ?? []
        services.sort()
        return services
    }

    get powerDevices() {
        return this.$store.getters['server/power/getDevices']
    }

    get service_states() {
        return this.$store.state.server.system_info?.service_state ?? {}
    }

    getServiceState(name: string) {
        if (name in this.service_states) return this.service_states[name].active_state

        return null
    }

    getServiceSubState(name: string) {
        if (name in this.service_states) return this.service_states[name].sub_state

        return null
    }

    checkDialog(executableFunction: any, serviceName: string | null = null) {
        if (this.printerIsPrinting) {
            const functionName = (executableFunction.name ?? 'unknown').replace('bound ', '')
            let action: string = 'Restart'
            const actionTypes = ['Start', 'Restart', 'Stop', 'Reboot', 'Shutdown']

            actionTypes.forEach((actionType: string) => {
                if (functionName.endsWith(actionType)) action = actionType
            })

            this.dialogConfirmation.executableFunction = executableFunction
            this.dialogConfirmation.serviceName = serviceName

            const functionNameUppercase = functionName.trim().charAt(0).toUpperCase() + functionName.trim().slice(1)
            this.dialogConfirmation.title = this.$t('App.TopCornerMenu.ConfirmationDialog.Title.' + functionNameUppercase)+''

            if (serviceName === 'klipper' && action === 'Stop') this.dialogConfirmation.description = this.$t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperStop')+''
            else this.dialogConfirmation.description = this.$t('App.TopCornerMenu.ConfirmationDialog.Description.' + functionNameUppercase)+''

            this.dialogConfirmation.actionButtonText = this.$t('App.TopCornerMenu.' + action.charAt(0).toUpperCase() + action.slice(1))+''
            this.dialogConfirmation.show = true
        } else executableFunction(serviceName)
    }

    executeDialog() {
        this.dialogConfirmation.executableFunction(this.dialogConfirmation.serviceName)
        this.dialogConfirmation.show = false
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

    serviceStart(service: string) {
        this.showMenu = false
        this.$socket.emit('machine.services.start', { service: service })
    }

    serviceRestart(service: string) {
        this.showMenu = false
        this.$socket.emit('machine.services.restart', { service: service })
    }

    serviceStop(service: string) {
        this.showMenu = false
        this.$socket.emit('machine.services.stop', { service: service })
    }

    changeSwitch(device: ServerPowerStateDevice, value: string) {
        this.dialogPowerDeviceChange.device = device.device
        this.dialogPowerDeviceChange.value = value

        const confirmOnPowerDeviceChange = this.$store.state.gui.uiSettings.confirmOnPowerDeviceChange
        if (confirmOnPowerDeviceChange) {
            this.dialogPowerDeviceChange.show = true
        } else {
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