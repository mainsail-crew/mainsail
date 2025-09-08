<template>
    <miscellaneous-slider
        v-if="isSingleChannelLight"
        :name="name"
        type="led"
        :rpm="null"
        :controllable="true"
        :pwm="true"
        :target="singleChannelTarget"
        :color-order="ledColorOrder" />
    <miscellaneous-light-neopixel v-else :type="type" :name="name" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MiscellaneousLightNeopixel from '@/components/panels/Miscellaneous/MiscellaneousLightNeopixel.vue'

@Component({
    components: { MiscellaneousLightNeopixel },
})
export default class MiscellaneousLight extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) declare readonly type: string
    @Prop({ type: String, required: true }) declare readonly name: string

    get config() {
        const settings = this.$store.state.printer.configfile.settings
        const configname = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        if (!(configname in settings)) return {}

        return settings[configname]
    }

    get ledColorOrder() {
        if (this.type !== 'led') return ''

        const pins = ['red_pin', 'green_pin', 'blue_pin', 'white_pin']
        let colorOrder = ''
        pins.forEach((pin) => {
            if (pin in this.config) colorOrder += pin.substring(0, 1).toUpperCase()
        })

        return colorOrder
    }

    get isSingleChannelLight() {
        if (this.type !== 'led') return false

        return this.ledColorOrder.length === 1
    }

    get printerState() {
        const printer = this.$store.state.printer
        const key = `${this.type} ${this.name}`

        if (!(key in printer)) return {}

        return printer[key]
    }

    get firstColorData() {
        if (!this.isSingleChannelLight) return []

        return this.printerState.color_data[0] ?? []
    }

    get singleChannelTarget() {
        if (!this.isSingleChannelLight) return 0

        switch (this.ledColorOrder) {
            case 'R':
                return this.firstColorData[0]

            case 'G':
                return this.firstColorData[1]

            case 'B':
                return this.firstColorData[2]

            case 'W':
                return this.firstColorData[3]
        }

        return 0
    }
}
</script>
