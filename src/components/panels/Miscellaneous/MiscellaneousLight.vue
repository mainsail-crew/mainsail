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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
    type: string
    name: string
}>()

const store = useStore()

const config = computed(() => {
    const settings = store.state.printer.configfile.settings
    const configname = `${props.type.toLowerCase()} ${props.name.toLowerCase()}`
    if (!(configname in settings)) return {}
    return settings[configname]
})

const ledColorOrder = computed(() => {
    if (props.type !== 'led') return ''
    const pins = ['red_pin', 'green_pin', 'blue_pin', 'white_pin']
    let colorOrder = ''
    pins.forEach((pin) => {
        if (pin in config.value) colorOrder += pin.substring(0, 1).toUpperCase()
    })
    return colorOrder
})

const isSingleChannelLight = computed(() => {
    if (props.type !== 'led') return false
    return ledColorOrder.value.length === 1
})

const printerState = computed(() => {
    const printer = store.state.printer
    const key = `${props.type} ${props.name}`
    if (!(key in printer)) return {}
    return printer[key]
})

const firstColorData = computed(() => {
    if (!isSingleChannelLight.value) return []
    return printerState.value.color_data[0] ?? []
})

const singleChannelTarget = computed(() => {
    if (!isSingleChannelLight.value) return 0
    switch (ledColorOrder.value) {
        case 'R':
            return firstColorData.value[0]
        case 'G':
            return firstColorData.value[1]
        case 'B':
            return firstColorData.value[2]
        case 'W':
            return firstColorData.value[3]
    }
    return 0
})
</script>
