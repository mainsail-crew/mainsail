<style scoped>
.minheight30 {
    min-height: 30px;
}
</style>

<template>
    <div>
        <v-menu v-model="showMenu" bottom left :offset-y="true" :close-on-content-click="false">
            <template #activator="{ on, attrs }">
                <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon>{{ mdiPowerStandby }}</v-icon>
                </v-btn>
            </template>
            <v-list dense>
                <template v-if="klipperState !== 'disconnected'">
                    <v-subheader class="" style="height: auto">
                        {{ $t('App.TopCornerMenu.KlipperControl') }}
                    </v-subheader>
                    <v-list-item
                        class="minheight30 pr-2"
                        link
                        @click="checkDialog(klipperRestart, 'klipper', 'restart')">
                        <v-list-item-title>{{ $t('App.TopCornerMenu.KlipperRestart') }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" small>{{ mdiRestart }}</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item
                        class="minheight30 pr-2"
                        link
                        @click="checkDialog(klipperFirmwareRestart, 'klipper', 'firmwareRestart')">
                        <v-list-item-title>{{ $t('App.TopCornerMenu.KlipperFirmwareRestart') }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" small>{{ mdiRestart }}</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <template v-if="services.length">
                    <v-divider v-if="klipperState !== 'disconnected'" class="mt-0"></v-divider>
                    <v-subheader class="pt-2" style="height: auto">
                        {{ $t('App.TopCornerMenu.ServiceControl') }}
                    </v-subheader>
                    <v-list-item v-for="service in services" :key="service" class="minheight30 pr-2">
                        <v-list-item-title>
                            <v-tooltip left>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        {{ service.charAt(0).toUpperCase() + service.slice(1) }}
                                    </span>
                                </template>
                                <span>{{ getServiceState(service) }} ({{ getServiceSubState(service) }})</span>
                            </v-tooltip>
                        </v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-btn
                                v-if="getServiceState(service) === 'inactive'"
                                icon
                                small
                                @click="checkDialog(serviceStart, service, 'start')">
                                <v-icon small>{{ mdiPlay }}</v-icon>
                            </v-btn>
                            <v-btn v-else icon small @click="checkDialog(serviceRestart, service, 'restart')">
                                <v-icon small>{{ mdiRestart }}</v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                small
                                :disabled="getServiceState(service) === 'inactive' || service === 'moonraker'"
                                :style="service === 'moonraker' ? 'visibility: hidden;' : ''"
                                @click="checkDialog(serviceStop, service, 'stop')">
                                <v-icon small>{{ mdiStop }}</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <template v-if="powerDevices.length">
                    <v-divider class="mt-0"></v-divider>
                    <v-subheader class="pt-2" style="height: auto">
                        {{ $t('App.TopCornerMenu.PowerDevices') }}
                    </v-subheader>
                    <v-list-item
                        v-for="(device, index) in powerDevices"
                        :key="index"
                        class="minheight30 pr-2"
                        :disabled="
                            device.status === 'error' ||
                            (device.locked_while_printing && ['printing', 'paused'].includes(printer_state))
                        "
                        @click="changeSwitch(device, device.status)">
                        <v-list-item-title>{{ device.device }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" :color="device.status === 'on' ? '' : 'grey darken-2'">
                                {{ device.status === 'on' ? mdiToggleSwitch : mdiToggleSwitchOff }}
                            </v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <v-divider class="mt-0"></v-divider>
                <v-subheader class="pt-2" style="height: auto">{{ $t('App.TopCornerMenu.HostControl') }}</v-subheader>
                <v-list-item class="minheight30 pr-2" link @click="checkDialog(hostReboot, 'host', 'reboot')">
                    <v-list-item-title>{{ $t('App.TopCornerMenu.Reboot') }}</v-list-item-title>
                    <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                        <v-icon class="mr-2" small>{{ mdiPower }}</v-icon>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item class="minheight30 pr-2" link @click="checkDialog(hostShutdown, 'host', 'shutdown')">
                    <v-list-item-title>{{ $t('App.TopCornerMenu.Shutdown') }}</v-list-item-title>
                    <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                        <v-icon class="mr-2" small>{{ mdiPower }}</v-icon>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogPowerDeviceChange.show" width="400" :fullscreen="isMobile">
            <v-card>
                <v-card-title class="headline">
                    {{
                        dialogPowerDeviceChange.value === 'off'
                            ? $t('PowerDeviceChangeDialog.TurnDeviceOn', { device: dialogPowerDeviceChange.device })
                            : $t('PowerDeviceChangeDialog.TurnDeviceOff', { device: dialogPowerDeviceChange.device })
                    }}
                </v-card-title>
                <v-card-text>{{ $t('PowerDeviceChangeDialog.AreYouSure') }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="dialogPowerDeviceChange.show = false">
                        {{ $t('PowerDeviceChangeDialog.No') }}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="powerDeviceToggle">
                        {{ $t('PowerDeviceChangeDialog.Yes') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogConfirmation.show" width="400" :fullscreen="isMobile">
            <panel
                card-class="confirm-top-corner-menu-dialog"
                :icon="mdiAlert"
                :title="dialogConfirmation.title"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogConfirmation.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
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
import { ServerPowerStateDevice } from '@/store/server/power/types'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiAlert,
    mdiCloseThick,
    mdiPowerStandby,
    mdiRestart,
    mdiPlay,
    mdiPower,
    mdiStop,
    mdiToggleSwitch,
    mdiToggleSwitchOff,
} from '@mdi/js'

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
    components: { Panel },
})
export default class TheTopCornerMenu extends Mixins(BaseMixin) {
    mdiAlert = mdiAlert
    mdiCloseThick = mdiCloseThick
    mdiPowerStandby = mdiPowerStandby
    mdiRestart = mdiRestart
    mdiPlay = mdiPlay
    mdiPower = mdiPower
    mdiStop = mdiStop
    mdiToggleSwitch = mdiToggleSwitch
    mdiToggleSwitchOff = mdiToggleSwitchOff

    showMenu = false
    dialogPowerDeviceChange: dialogPowerDeviceChange = {
        show: false,
        device: '',
        value: '',
    }

    dialogConfirmation: dialogConfirmation = {
        show: false,
        serviceName: null,
        executableFunction: null,
        title: '',
        description: '',
        actionButtonText: '',
    }

    get services() {
        const services =
            this.$store.state.server.system_info?.available_services?.filter(
                (name: string) => name !== 'klipper_mcu'
            ) ?? []
        services.sort()
        return services
    }

    get powerDevices() {
        const devices = this.$store.getters['server/power/getDevices'] ?? []

        return devices.filter((device: ServerPowerStateDevice) => !device.device.startsWith('_'))
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

    checkDialog(executableFunction: any, serviceName: string, action: string) {
        if (this.printerIsPrinting) {
            this.dialogConfirmation.executableFunction = executableFunction
            this.dialogConfirmation.serviceName = serviceName

            const actionUppercase = action.trim().charAt(0).toUpperCase() + action.trim().slice(1)
            let titleKey = 'App.TopCornerMenu.ConfirmationDialog.Title.Service' + actionUppercase
            let descriptionKey = 'App.TopCornerMenu.ConfirmationDialog.Description.Service' + actionUppercase
            let buttonKey = 'App.TopCornerMenu.' + actionUppercase

            if (serviceName === 'klipper' && ['stop', 'restart', 'firmwareRestart'].includes(action)) {
                titleKey =
                    'App.TopCornerMenu.ConfirmationDialog.Title.' +
                    (action !== 'stop' ? 'Klipper' : 'Service') +
                    actionUppercase
                descriptionKey = 'App.TopCornerMenu.ConfirmationDialog.Description.Klipper' + actionUppercase

                if (action === 'firmwareRestart') buttonKey = 'App.TopCornerMenu.KlipperFirmwareRestart'
            } else if (serviceName === 'host') {
                titleKey = 'App.TopCornerMenu.ConfirmationDialog.Title.Host' + actionUppercase
                descriptionKey = 'App.TopCornerMenu.ConfirmationDialog.Description.Host' + actionUppercase
            }

            this.dialogConfirmation.title = this.$t(titleKey).toString()
            this.dialogConfirmation.description = this.$t(descriptionKey).toString()
            this.dialogConfirmation.actionButtonText = this.$t(buttonKey).toString()
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
        const rpc =
            this.dialogPowerDeviceChange.value === 'off' ? 'machine.device_power.on' : 'machine.device_power.off'
        this.$socket.emit(
            rpc,
            { [this.dialogPowerDeviceChange.device]: null },
            { action: 'server/power/responseToggle' }
        )
    }

    hostReboot() {
        this.showMenu = false
        this.$socket.emit('machine.reboot', {})
    }

    hostShutdown() {
        this.showMenu = false
        this.$socket.emit('machine.shutdown', {})
    }
}
</script>
