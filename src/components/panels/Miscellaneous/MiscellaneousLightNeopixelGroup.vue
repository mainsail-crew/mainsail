<template>
    <v-subheader class="_light-subheader">
        <v-icon small left @click="toggle">
            {{ isOn ? mdiLightbulbOnOutline : mdiLightbulbOutline }}
        </v-icon>
        <span>{{ group.name }}</span>
        <v-spacer />
        <miscellaneous-light-neopixel-state
            :type="type"
            :name="name"
            :index="group.start"
            @click-button="showDialog = true" />
        <miscellaneous-light-neopixel-dialog
            v-model="showDialog"
            :type="type"
            :name="name"
            :index="group.start"
            @update-color="sendCommand" />
    </v-subheader>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { mdiLightbulbOutline, mdiLightbulbOnOutline } from '@mdi/js'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'
import MiscellaneousLightNeopixelDialog from '@/components/dialogs/MiscellaneousLightNeopixelDialog.vue'

const props = defineProps<{
    type: string
    name: string
    group: GuiMiscellaneousStateEntryLightgroup
}>()

const store = useStore()
const socket = useSocket()

const mdiLightbulbOnOutline = mdiLightbulbOnOutline
const mdiLightbulbOutline = mdiLightbulbOutline

const showDialog = ref(false)

const settings = computed(() => {
    const s = store.state.printer.configfile.settings ?? {}
    const key = `${props.type.toLowerCase()} ${props.name.toLowerCase()}`
    return s[key] ?? {}
})

const colorOrder = computed(() => {
    const co = settings.value.color_order ?? []
    return co[props.group.start - 1] ?? co[0] ?? ''
})

const printerObject = computed(() => {
    const printer = store.state.printer ?? {}
    const key = `${props.type} ${props.name}`
    return printer[key] ?? {}
})

const colorData = computed(() => {
    const cd = printerObject.value.color_data ?? []
    return cd[props.group.start - 1] ?? []
})

const isOn = computed(() => {
    const red = colorData.value[0] ?? 0
    const green = colorData.value[1] ?? 0
    const blue = colorData.value[2] ?? 0
    const white = colorData.value[3] ?? 0
    return (red + green + blue + white) > 0
})

function toggle() {
    if (isOn.value) {
        sendCommand(0, 0, 0, 0)
        return
    }
    if (colorOrder.value.includes('W')) {
        sendCommand(0, 0, 0, 1)
        return
    }
    sendCommand(1, 1, 1, 1)
}

function sendCommand(red: number, green: number, blue: number, white: number) {
    const commandParts = []
    commandParts.push('SET_LED')
    commandParts.push(`LED="${props.name}"`)
    if (colorOrder.value.includes('R')) commandParts.push(`RED=${red}`)
    if (colorOrder.value.includes('G')) commandParts.push(`GREEN=${green}`)
    if (colorOrder.value.includes('B')) commandParts.push(`BLUE=${blue}`)
    if (colorOrder.value.includes('W')) commandParts.push(`WHITE=${white}`)
    commandParts.push('SYNC=0')

    const lines = []
    const command = commandParts.join(' ')
    for (let i = props.group.start; i <= props.group.end; i++) {
        lines.push(`${command} INDEX=${i}`)
    }
    lines[lines.length - 1] += ' TRANSMIT=1'

    const gcode = lines.join('\n')
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode })
}
</script>

<style scoped>
._light-subheader {
    height: auto;
}
</style>
