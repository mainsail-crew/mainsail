<template>
    <div>
        <div ref="picker"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import iro from '@jaames/iro'
import type { IroColor } from '@irojs/iro-core'
import type { ColorPickerProps, IroColorPicker as IroCP } from '@jaames/iro/dist/ColorPicker.d'

const props = defineProps<{
    color?: IroColor | string
    options?: ColorPickerProps
}>()

const emit = defineEmits<{
    (e: 'change', color: IroColor): void
    (e: 'update:color', color: IroColor): void
}>()

useBase()

let colorPicker: IroCP | null = null
const picker = ref<HTMLElement | null>(null)

watch(() => props.color, (value) => {
    if (colorPicker && colorPicker.color.rgbString !== value) {
        colorPicker.color.rgbString = value as string
    }
}, { deep: true })

const internalOptions = computed<ColorPickerProps>(() => ({
    ...(props.options ?? {}),
    color: props.color ?? '#ffffff',
    borderWidth: 2,
    sliderSize: 16,
}))

function emitColorChange(color: IroColor) {
    emit('change', color)
    emit('update:color', color)
}

function onColorChange(color: IroColor) {
    emitColorChange(color)
}

onMounted(() => {
    colorPicker = iro.ColorPicker(picker.value!, internalOptions.value)
    colorPicker.on('color:change', onColorChange)
})

onBeforeUnmount(() => {
    colorPicker?.off('color:change', onColorChange)
})
</script>

<style scoped></style>
