<template>
    <v-btn
        :color="buttonColor"
        :loading="isLoading"
        :disabled="printerIsPrintingOnly"
        class="text-uppercase"
        size="small"
        @click="toggleEffect">
        {{ name }}
    </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'

interface LedEffectState {
    enabled: boolean
}

const store = useStore()
const socket = useSocket()
const { printerIsPrintingOnly, loadings } = useBase()

const props = defineProps<{
    name: string
}>()

const ledEffectState = computed<LedEffectState | undefined>(() => {
    const printer = store.state.printer ?? {}
    const objectKey = `led_effect ${props.name}`

    return printer[objectKey]
})

const isEnabled = computed(() => ledEffectState.value?.enabled ?? false)

const buttonColor = computed(() => (isEnabled.value ? 'success' : 'primary'))

const loadingKey = computed(() => `led_effect_${props.name}`)

const isLoading = computed(() => loadings.value.includes(loadingKey.value))

function toggleEffect() {
    let command = `SET_LED_EFFECT EFFECT="${props.name}"`
    if (isEnabled.value) command += ' STOP=1'

    store.dispatch('server/addEvent', { message: command, type: 'command' })
    socket.emit('printer.gcode.script', { script: command }, { loading: loadingKey.value })
}
</script>
