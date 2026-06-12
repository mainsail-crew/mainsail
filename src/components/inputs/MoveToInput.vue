<template>
    <form @submit.prevent="submit">
        <v-text-field
            v-model="position"
            :label="`[ ${label} ]`"
            :suffix="suffix"
            :disabled="disabled"
            :step="step"
            :readonly="readonly"
            hide-details="auto"
            type="number"
            hide-spin-buttons
            variant="outlined"
            reverse
            density="compact"
            @blur="onBlur"
            @focus="!readonly ? $event.target.select() : {}"></v-text-field>
    </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBase } from '@/composables/useBase'

const props = defineProps<{
    position: string
    currentPos: string
    label?: string
    suffix?: string
    step?: number
    disabled?: boolean
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:position', value: string): void
    (e: 'submit'): void
}>()

const position = computed({
    get: () => props.position,
    set: (val) => emit('update:position', val),
})

function onBlur() {
    if (position.value !== props.currentPos) {
        position.value = props.currentPos
    }
}

function submit(): void {
    emit('submit')
}
</script>
