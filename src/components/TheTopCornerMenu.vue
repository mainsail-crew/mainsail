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
                        class="minHeight30 pr-2"
                        link
                        @click="checkDialog(klipperRestart, 'klipper', 'restart')">
                        <v-list-item-title>{{ $t('App.TopCornerMenu.KlipperRestart') }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" small>{{ mdiRestart }}</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item
                        class="minHeight30 pr-2"
                        link
                        @click="checkDialog(klipperFirmwareRestart, 'klipper', 'firmwareRestart')">
                        <v-list-item-title>{{ $t('App.TopCornerMenu.KlipperFirmwareRestart') }}</v-list-item-title>
                        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" small>{{ mdiRestart }}</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </template>
                <template v-if="services.length">
                    <v-divider v-if="klipperState !== 'disconnected'" class="mt-0" />
                    <v-subheader class="pt-2" style="height: auto">
                        {{ $t('App.TopCornerMenu.ServiceControl') }}
                    </v-subheader>
                    <top-corner-menu-service
                        v-for="service in services"
                        :key="service"
                        :service="service"
                        @close-menu="showMenu = false" />
                </template>
                <template v-if="powerDevices.length">
                    <v-divider class="mt-0"></v-divider>
                    <v-subheader class="pt-2" style="height: auto">
                        {{ $t('App.TopCornerMenu.PowerDevices') }}
                    </v-subheader>
                    <v-list-item
                        v-for="(device, index) in powerDevices"
                        :key="index"
                        class="minHeight30 pr-2"
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
                <v-list-item class="minHeight30 pr-2" link @click="checkDialog(hostReboot, 'host', 'reboot')">
                    <v-list-item-title>{{ $t('App.TopCornerMenu.Reboot') }}</v-list-item-title>
                    <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                        <v-icon class="mr-2" small>{{ mdiPower }}</v-icon>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item class="minHeight30 pr-2" link @click="checkDialog(hostShutdown, 'host', 'shutdown')">
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
        <confirmation-dialog
            :show="dialogConfirmation.show"
            :title="dialogConfirmation.title"
            :text="dialogConfirmation.description"
            :action-button-text="dialogConfirmation.actionButtonText"
            :cancel-button-text="$t('App.TopCornerMenu.Cancel')"
            @action="executeDialog"
            @close="dialogConfirmation.show = false" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerPowerStateDevice } from '@/store/server/power/types'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiPowerStandby, mdiRestart, mdiPower, mdiToggleSwitch, mdiToggleSwitchOff } from '@mdi/js'
import TopCornerMenuService from '@/components/ui/TopCornerMenuService.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import ServiceMixins from '@/components/mixins/services'

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
    components: { ConfirmationDialog, TopCornerMenuService, Panel },
})
export default class TheTopCornerMenu extends Mixins(BaseMixin, ServiceMixins) {
    mdiCloseThick = mdiCloseThick
    mdiPowerStandby = mdiPowerStandby
    mdiRestart = mdiRestart
    mdiPower = mdiPower
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
        let services =
            this.$store.state.server.system_info?.available_services?.filter(
                (name: string) => name !== 'klipper_mcu'
            ) ?? []

        if (this.hideOtherInstances && this.klipperInstance !== '') {
            services = services.filter(
                (name: string) =>
                    (!name.toLowerCase().startsWith('klipper-') && name.toLowerCase() !== 'klipper') ||
                    name === this.klipperInstance
            )
        }

        if (this.hideOtherInstances && this.moonrakerInstance !== '') {
            services = services.filter(
                (name: string) =>
                    (!name.toLowerCase().startsWith('moonraker-') && name.toLowerCase() !== 'moonraker') ||
                    name === this.moonrakerInstance
            )
        }

        return services.sort()
    }

    get powerDevices() {
        const devices = this.$store.getters['server/power/getDevices'] ?? []

        return devices.filter((device: ServerPowerStateDevice) => !device.device.startsWith('_'))
    }

    checkDialog(executableFunction: any, serviceName: string, action: string) {
        if (!this.printerIsPrinting) {
            executableFunction(serviceName)
            return
        }

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
