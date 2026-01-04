<template>
    <v-row class="my-0">
        <v-col class="py-2">
            <v-subheader class="_light-subheader">
                <v-icon v-if="groups.length === 0" small left @click="toggle">
                    {{ isOn ? mdiLightbulbOnOutline : mdiLightbulbOutline }}
                </v-icon>
                <span>{{ outputName }}</span>
                <v-spacer />
                <miscellaneous-light-neopixel-state
                    v-if="groups.length === 0"
                    :type="type"
                    :name="name"
                    :index="1"
                    @click-button="showDialog = true" />
                <miscellaneous-light-neopixel-dialog
                    v-model="showDialog"
                    :type="type"
                    :name="name"
                    @update-color="sendCommand" />
            </v-subheader>
            <miscellaneous-light-neopixel-group
                v-for="group in groups"
                :key="group.id"
                :type="type"
                :name="name"
                :group="group" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiLightbulbOutline, mdiLightbulbOnOutline } from '@mdi/js'
import { convertName } from '@/plugins/helpers'
import { GuiMiscellaneousStateEntry } from '@/store/gui/miscellaneous/types'
import MiscellaneousLightNeopixelGroup from '@/components/panels/Miscellaneous/MiscellaneousLightNeopixelGroup.vue'
import MiscellaneousLightNeopixelDialog from '@/components/dialogs/MiscellaneousLightNeopixelDialog.vue'

@Component({
    components: { MiscellaneousLightNeopixelGroup, MiscellaneousLightNeopixelDialog },
})
export default class MiscellaneousLightNeopixel extends Mixins(BaseMixin) {
    mdiLightbulbOnOutline = mdiLightbulbOnOutline
    mdiLightbulbOutline = mdiLightbulbOutline

    @Prop({ type: String, required: true }) declare readonly type: string
    @Prop({ type: String, required: true }) declare readonly name: string

    showDialog = false

    get outputName() {
        return convertName(this.name)
    }

    get guiMiscellaneousEntries(): { [key: string]: GuiMiscellaneousStateEntry } {
        return this.$store.state.gui.miscellaneous.entries ?? {}
    }

    get guiEntry() {
        const result = Object.entries(this.guiMiscellaneousEntries).find(([, value]) => {
            return value.type === this.type && value.name === this.name
        })

        return result ? result[1] : null
    }

    get groups() {
        if (!this.guiEntry?.lightgroups) return []

        return Object.entries(this.guiEntry.lightgroups).map(([key, value]) => {
            return { ...value, id: key }
        })
    }

    get settings() {
        const settings = this.$store.state.printer.configfile.settings ?? {}

        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        return settings[key] ?? {}
    }

    get colorOrder() {
        if (this.type !== 'led') {
            const colorOrder = this.settings.color_order ?? []

            return colorOrder[0] ?? ''
        }

        const pins = ['red_pin', 'green_pin', 'blue_pin', 'white_pin']
        let colorOrder = ''
        pins.forEach((pin) => {
            if (pin in this.settings) colorOrder += pin.substring(0, 1).toUpperCase()
        })

        return colorOrder
    }

    get printerObject() {
        const printer = this.$store.state.printer ?? {}
        const key = `${this.type} ${this.name}`

        return printer[key] ?? {}
    }

    get colorData() {
        return this.printerObject.color_data ?? []
    }

    get isOn() {
        const data = this.colorData[0] ?? []

        const red = data[0] ?? 0
        const green = data[1] ?? 0
        const blue = data[2] ?? 0
        const white = data[3] ?? 0

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
        commandParts.push('TRANSMIT=1')

        const gcode = commandParts.join(' ')
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
