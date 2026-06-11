<template>
    <v-list-item class="px-0">
        <template #title>
            <span class="text-primary font-weight-bold cursor-pointer" @click="onCommand">{{ command }}</span>
        </template>
        <template #subtitle v-if="description">
            <span class="text-wrap">{{ description }}</span>
        </template>
    </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
    command: string
}>()

const emit = defineEmits<{
    (e: 'click-on-command', command: string): void
}>()

const store = useStore()

const commands = computed(() => store.state.printer.gcode?.commands ?? {})

const commandObject = computed(() => commands.value[props.command] ?? {})

const description = computed<string | null>(() => commandObject.value.help ?? null)


function onCommand() {
    emit('click-on-command', props.command)
}
</script>
