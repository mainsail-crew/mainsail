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
            :show-dialog="showDialog"
            :type="type"
            :name="name"
            :index="group.start"
            @close="showDialog = false"
            @update-color="sendCommand" />
    </v-subheader>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiLightbulbOutline, mdiLightbulbOnOutline } from '@mdi/js'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

@Component
export default class MiscellaneousLightNeopixelGroup extends Mixins(BaseMixin) {
    mdiLightbulbOnOutline = mdiLightbulbOnOutline
    mdiLightbulbOutline = mdiLightbulbOutline

    @Prop({ type: String, required: true }) declare readonly type: string
    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Object, required: true }) declare readonly group: GuiMiscellaneousStateEntryLightgroup

    showDialog = false

    get settings() {
        const settings = this.$store.state.printer.configfile.settings ?? {}

        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        return settings[key] ?? {}
    }

    get colorOrder() {
        const colorOrder = this.settings.color_order ?? []

        return colorOrder[this.group.start - 1] ?? colorOrder[0] ?? ''
    }

    get printerObject() {
        const printer = this.$store.state.printer ?? {}
        const key = `${this.type} ${this.name}`

        return printer[key] ?? {}
    }

    get colorData() {
        const colorData = this.printerObject.color_data ?? []

        return colorData[this.group.start - 1] ?? []
    }

    get isOn() {
        const red = this.colorData[0] ?? 0
        const green = this.colorData[1] ?? 0
        const blue = this.colorData[2] ?? 0
        const white = this.colorData[3] ?? 0

        const sum = red + green + blue + white

        return sum > 0
    }

    toggle() {
        if (this.isOn) {
            this.sendCommand(0, 0, 0, 0)
            return
        }

        // only turn on white LEDs if its exists
        if (this.colorOrder.includes('W')) {
            this.sendCommand(0, 0, 0, 1)
            return
        }

        this.sendCommand(1, 1, 1, 1)
    }

    sendCommand(red: number, green: number, blue: number, white: number) {
        const commandParts = []
        commandParts.push('SET_LED')
        commandParts.push(`LED="${this.name}"`)

        if (this.colorOrder.includes('R')) commandParts.push(`RED=${red}`)
        if (this.colorOrder.includes('G')) commandParts.push(`GREEN=${green}`)
        if (this.colorOrder.includes('B')) commandParts.push(`BLUE=${blue}`)
        if (this.colorOrder.includes('W')) commandParts.push(`WHITE=${white}`)

        commandParts.push('SYNC=0')

        let lines = []
        const command = commandParts.join(' ')
        for (let i = this.group.start; i <= this.group.end; i++) {
            lines.push(`${command} INDEX=${i}`)
        }

        lines[lines.length - 1] += ' TRANSMIT=1'

        const gcode = lines.join('\n')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped>
._light-subheader {
    height: auto;
}
</style>
