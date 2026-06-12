<template>
    <div>
        <v-menu v-model="showMenu" location="bottom end" :close-on-content-click="false">
            <template #activator="{ props }">
                <v-btn :icon="mdiPowerStandby" tile v-bind="props" />
            </template>
            <v-list density="compact">
                <template v-if="klipperState !== 'disconnected'">
                    <v-list-subheader class="" style="height: auto">
                        {{ $t('App.TopCornerMenu.KlipperControl') }}
                    </v-list-subheader>
                    <v-list-item
                        class="minHeight30 pr-2"
                        link
                        @click="checkDialog(klipperRestart, 'klipper', 'restart')">
                        <template #title>{{ $t('App.TopCornerMenu.KlipperRestart') }}</template>
                        <template #append>
                            <div class="my-0 d-flex flex-row" style="min-width: auto">
                                <v-icon class="mr-2" size="small">{{ mdiRestart }}</v-icon>
                            </div>
                        </template>
                    </v-list-item>
                    <v-list-item
                        class="minHeight30 pr-2"
                        link
                        @click="checkDialog(klipperFirmwareRestart, 'klipper', 'firmwareRestart')">
                        <template #title>{{ $t('App.TopCornerMenu.KlipperFirmwareRestart') }}</template>
                        <template #append>
                            <div class="my-0 d-flex flex-row" style="min-width: auto">
                                <v-icon class="mr-2" size="small">{{ mdiRestart }}</v-icon>
                            </div>
                        </template>
                    </v-list-item>
                </template>
                <template v-if="services.length">
                    <v-divider v-if="klipperState !== 'disconnected'" class="mt-0" />
                    <v-list-subheader class="pt-2" style="height: auto">
                        {{ $t('App.TopCornerMenu.ServiceControl') }}
                    </v-list-subheader>
                    <top-corner-menu-service
                        v-for="service in services"
                        :key="service"
                        :service="service"
                        @close-menu="showMenu = false" />
                </template>
                <template v-if="powerDevices.length">
                    <v-divider class="mt-0"></v-divider>
                    <v-list-subheader class="pt-2" style="height: auto">
                        {{ $t('App.TopCornerMenu.PowerDevices') }}
                    </v-list-subheader>
                    <v-list-item
                        v-for="(device, index) in powerDevices"
                        :key="index"
                        class="minHeight30 pr-2"
                        :disabled="
                            device.status === 'error' ||
                            (device.locked_while_printing && ['printing', 'paused'].includes(printer_state))
                        "
                        @click="changeSwitch(device, device.status)">
                        <template #title>{{ device.device }}</template>
                        <template #append>
                            <div class="my-0 d-flex flex-row" style="min-width: auto">
                                <v-icon class="mr-2" :color="device.status === 'on' ? '' : 'grey darken-2'">
                                    {{ device.status === 'on' ? mdiToggleSwitch : mdiToggleSwitchOff }}
                                </v-icon>
                            </div>
                        </template>
                    </v-list-item>
                </template>
                <v-divider class="mt-0"></v-divider>
                <v-list-subheader class="pt-2" style="height: auto">{{ $t('App.TopCornerMenu.HostControl') }}</v-list-subheader>
                <v-list-item class="minHeight30 pr-2" link @click="checkDialog(hostReboot, 'host', 'reboot')">
                    <template #title>{{ $t('App.TopCornerMenu.Reboot') }}</template>
                    <template #append>
                        <div class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" size="small">{{ mdiPower }}</v-icon>
                        </div>
                    </template>
                </v-list-item>
                <v-list-item class="minHeight30 pr-2" link @click="checkDialog(hostShutdown, 'host', 'shutdown')">
                    <template #title>{{ $t('App.TopCornerMenu.Shutdown') }}</template>
                    <template #append>
                        <div class="my-0 d-flex flex-row" style="min-width: auto">
                            <v-icon class="mr-2" size="small">{{ mdiPower }}</v-icon>
                        </div>
                    </template>
                </v-list-item>
            </v-list>
        </v-menu>
        <confirmation-dialog
            v-model="dialogPowerDeviceChange.show"
            :title="powerDeviceDialogTitle"
            :text="$t('PowerDeviceChangeDialog.AreYouSure')"
            :action-button-text="$t('Buttons.Yes')"
            :cancel-button-text="$t('Buttons.No')"
            @action="powerDeviceToggle" />
        <confirmation-dialog
            v-model="dialogConfirmation.show"
            :title="dialogConfirmation.title"
            :text="dialogConfirmation.description"
            :action-button-text="dialogConfirmation.actionButtonText"
            @action="executeDialog" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useServices } from '@/composables/useServices'
import { useSocket } from '@/composables/useSocket'
import { ServerPowerStateDevice } from '@/store/server/power/types'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiPowerStandby, mdiRestart, mdiPower, mdiToggleSwitch, mdiToggleSwitchOff } from '@mdi/js'
import TopCornerMenuService from '@/components/ui/TopCornerMenuService.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

interface dialogPowerDeviceChange {
    show: boolean
    device: string
    value: string
}

interface dialogConfirmation {
    show: boolean
    serviceName: string | null
    executableFunction: ((serviceName: string) => void) | null
    title: string
    description: string
    actionButtonText: string
}

const store = useStore()
const { t } = useI18n()
const { klipperState, printer_state, printerIsPrinting } = useBase()
const { hideOtherInstances, klipperInstance, moonrakerInstance } = useServices()
const socket = useSocket()

const showMenu = ref(false)
const dialogPowerDeviceChange = ref<dialogPowerDeviceChange>({
    show: false,
    device: '',
    value: '',
})
const dialogConfirmation = ref<dialogConfirmation>({
    show: false,
    serviceName: null,
    executableFunction: null,
    title: '',
    description: '',
    actionButtonText: '',
})

const services = computed(() => {
    let services =
        store.state.server.system_info?.available_services?.filter(
            (name: string) => name !== 'klipper_mcu'
        ) ?? []

    if (hideOtherInstances.value && klipperInstance.value !== '') {
        services = services.filter(
            (name: string) =>
                (!name.toLowerCase().startsWith('klipper-') && name.toLowerCase() !== 'klipper') ||
                name === klipperInstance.value
        )
    }

    if (hideOtherInstances.value && moonrakerInstance.value !== '') {
        services = services.filter(
            (name: string) =>
                (!name.toLowerCase().startsWith('moonraker-') && name.toLowerCase() !== 'moonraker') ||
                name === moonrakerInstance.value
        )
    }

    return services.sort()
})

const powerDevices = computed(() => {
    const devices = store.getters['server/power/getDevices'] ?? []
    return devices.filter((device: ServerPowerStateDevice) => !device.device.startsWith('_'))
})

const powerDeviceDialogTitle = computed((): string => {
    return dialogPowerDeviceChange.value.value === 'off'
        ? t('PowerDeviceChangeDialog.TurnDeviceOn', {
              device: dialogPowerDeviceChange.value.device,
          }).toString()
        : t('PowerDeviceChangeDialog.TurnDeviceOff', {
              device: dialogPowerDeviceChange.value.device,
          }).toString()
})

function checkDialog(executableFunction: (serviceName: string) => void, serviceName: string, action: string) {
    if (!printerIsPrinting.value) {
        executableFunction(serviceName)
        return
    }

    dialogConfirmation.value.executableFunction = executableFunction
    dialogConfirmation.value.serviceName = serviceName

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

    dialogConfirmation.value.title = t(titleKey).toString()
    dialogConfirmation.value.description = t(descriptionKey).toString()
    dialogConfirmation.value.actionButtonText = t(buttonKey).toString()
    dialogConfirmation.value.show = true
}

function executeDialog() {
    const serviceName = dialogConfirmation.value.serviceName
    if (serviceName !== null && dialogConfirmation.value.executableFunction !== null) {
        dialogConfirmation.value.executableFunction(serviceName)
    }
}

function klipperRestart() {
    showMenu.value = false
    store.dispatch('server/addEvent', { message: 'RESTART', type: 'command' })
    socket.emit('printer.gcode.script', { script: 'RESTART' })
}

function klipperFirmwareRestart() {
    showMenu.value = false
    store.dispatch('server/addEvent', { message: 'FIRMWARE_RESTART', type: 'command' })
    socket.emit('printer.gcode.script', { script: 'FIRMWARE_RESTART' })
}

function changeSwitch(device: ServerPowerStateDevice, value: string) {
    dialogPowerDeviceChange.value.device = device.device
    dialogPowerDeviceChange.value.value = value

    const confirmOnPowerDeviceChange = store.state.gui.uiSettings.confirmOnPowerDeviceChange
    if (confirmOnPowerDeviceChange) {
        dialogPowerDeviceChange.value.show = true
    } else {
        powerDeviceToggle()
    }
}

function powerDeviceToggle() {
    const rpc =
        dialogPowerDeviceChange.value.value === 'off' ? 'machine.device_power.on' : 'machine.device_power.off'
    socket.emit(
        rpc,
        { [dialogPowerDeviceChange.value.device]: null },
        { action: 'server/power/responseToggle' }
    )
}

function hostReboot() {
    showMenu.value = false
    socket.emit('machine.reboot', {})
}

function hostShutdown() {
    showMenu.value = false
    socket.emit('machine.shutdown', {})
}
</script>
