<template>
    <span class="_currentState" :style="currentStateStyle" @click="clickButton"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
    type: string
    name: string
    index: number
}>()

const emit = defineEmits<{
    'click-button': []
}>()

const store = useStore()

const printerObject = computed(() => {
    const printer = store.state.printer ?? {}
    return printer[`${props.type} ${props.name}`] ?? {}
})

const colorData = computed(() => printerObject.value.color_data ?? [])

const current = computed(() => {
    const data = colorData.value[props.index - 1] ?? []
    return {
        red: data[0] ?? null,
        green: data[1] ?? null,
        blue: data[2] ?? null,
        white: data[3] ?? null,
    }
})

const currentStateStyle = computed(() => {
    const red = Math.round((current.value.red ?? 0) * 255)
    const green = Math.round((current.value.green ?? 0) * 255)
    const blue = Math.round((current.value.blue ?? 0) * 255)
    const white = Math.round((current.value.white ?? 0) * 255)

    let output = `rgba(${red}, ${green}, ${blue})`
    if (red === 0 && green === 0 && blue === 0 && white > 0) {
        output = `rgb(${white}, ${white}, ${white})`
    }
    return { 'background-color': output }
})

function clickButton() {
    emit('click-button')
}
</script>

<style scoped>
._currentState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    cursor: pointer;
}
</style>
