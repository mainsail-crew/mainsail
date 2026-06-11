<template>
    <v-list-item class="px-0" :two-line="twoLine">
        <v-list-item-content class="px-0">
            <v-list-item-title class="primary--text font-weight-bold cursor-pointer" @click="onCommand">
                {{ command }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="description" class="text-wrap">{{ description }}</v-list-item-subtitle>
        </v-list-item-content>
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

const twoLine = computed(() => description.value !== null)

function onCommand() {
    emit('click-on-command', props.command)
}
</script>
