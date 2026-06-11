<template>
    <v-tooltip top>
        <template #activator="{ on, attrs }">
            <div :style="presetStyle" v-bind="attrs" v-on="on" @click="usePreset" />
        </template>
        <span>{{ name }}</span>
    </v-tooltip>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

const props = defineProps({
    preset: { type: Object as () => GuiMiscellaneousStateEntryPreset, required: true },
})
const emit = defineEmits(['update-color'])

const name = computed(() => props.preset.name)

const presetStyle = computed(() => {
    const red = props.preset.red ?? 0
    const green = props.preset.green ?? 0
    const blue = props.preset.blue ?? 0
    const white = props.preset.white ?? 0
    const RGBSum = red + green + blue

    if (RGBSum && white > 0) {
        return { backgroundColor: `rgb(${white}%, ${white}%, ${white}%)` }
    }

    return { backgroundColor: `rgb(${red}%, ${green}%, ${blue}%)` }
})

function usePreset() {
    const red = props.preset.red ?? 0
    const green = props.preset.green ?? 0
    const blue = props.preset.blue ?? 0
    const white = props.preset.white ?? 0

    emit('update-color', { red, green, blue, white })
}
</script>
