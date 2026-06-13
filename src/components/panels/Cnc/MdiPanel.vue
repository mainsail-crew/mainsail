<template>
    <panel v-if="klipperReadyForGui" :icon="mdiConsole" title="MDI" :collapsible="true" card-class="mdi-panel">
        <v-container class="py-2">
            <v-row density="compact" class="mb-2">
                <v-col cols="12">
                    <console-textarea />
                </v-col>
            </v-row>

            <v-divider class="my-3" />

            <v-row density="compact" class="mb-2">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Quick Commands:</span>
                </v-col>
                <v-col v-for="command in quickCommands" :key="command.label" cols="6" sm="3">
 <v-btn size="small" class="d-block w-100" variant="outlined" @click="runCommand(command.command)">
                        {{ command.label }}
                    </v-btn>
                </v-col>
            </v-row>

            <v-row v-if="showWorkCoords" density="compact">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Work Coordinate Systems:</span>
                </v-col>
                <v-col v-for="wcs in workCoordinateSystems" :key="wcs" cols="4" sm="2">
 <v-btn size="small" class="d-block w-100" variant="outlined" @click="runCommand(wcs)">
                        {{ wcs }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useCncProfile } from '@/composables/useCncProfile'
import Panel from '@/components/ui/Panel.vue'
import ConsoleTextarea from '@/components/inputs/ConsoleTextarea.vue'
import { mdiConsole } from '@mdi/js'

const { klipperReadyForGui } = useBase()
const { doSend } = useControl()
const { showWorkCoords } = useCncProfile()

const quickCommands = [
    { label: 'G20 mm', command: 'G20' },
    { label: 'G21 inch', command: 'G21' },
    { label: 'G90 abs', command: 'G90' },
    { label: 'G91 rel', command: 'G91' },
]

const workCoordinateSystems = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']

function runCommand(command: string) {
    doSend(command)
}
</script>

<style scoped>
</style>
