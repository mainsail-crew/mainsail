<template>
    <panel v-if="klipperReadyForGui" :icon="mdiConsole" title="MDI" :collapsible="true" card-class="mdi-panel">
        <v-container class="py-2">
            <!-- G-code Input -->
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">G-code Command:</span>
                </v-col>
                <v-col cols="12" class="d-flex gap-2">
                    <v-text-field
                        v-model="gCodeInput"
                        label="Enter G-code command"
                        outlined
                        dense
                        small
                        single-line
                        class="flex-grow-1"
                        @keydown.enter="sendCommand"
                        placeholder="e.g., G28, G0 X0 Y0, M109 S200" />
                    <v-btn
                        small
                        color="primary"
                        :loading="sending"
                        :disabled="!gCodeInput.trim() || sending"
                        @click="sendCommand">
                        <v-icon left small>{{ mdiSend }}</v-icon>
                        Send
                    </v-btn>
                </v-col>
            </v-row>

            <!-- Command History -->
            <v-row dense class="mb-2">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Recent Commands:</span>
                </v-col>
                <v-col cols="12">
                    <div class="command-history pa-2 rounded" :class="$vuetify.theme.dark ? 'grey darken-4' : 'grey lighten-5'">
                        <div v-if="commandHistory.length === 0" class="text-caption text--secondary text-center pa-2">
                            No commands sent yet
                        </div>
                        <div v-for="(cmd, idx) in commandHistory" :key="`${cmd}-${idx}`" class="command-item d-flex justify-space-between align-center pa-2 mb-1 rounded" :class="$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-4'">
                            <span class="text-caption font-weight-medium">{{ cmd }}</span>
                            <v-btn
                                x-small
                                text
                                color="primary"
                                @click="repeatCommand(cmd)"
                                title="Send this command again">
                                <v-icon x-small>{{ mdiReplay }}</v-icon>
                            </v-btn>
                        </div>
                    </div>
                </v-col>
            </v-row>

            <!-- Clear History Button -->
            <v-row dense>
                <v-col cols="12">
                    <v-btn
                        x-small
                        text
                        :disabled="commandHistory.length === 0"
                        @click="clearHistory">
                        Clear History
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import {
    mdiConsole,
    mdiSend,
    mdiReplay,
} from '@mdi/js'

@Component({
    components: {
        Panel,
    },
})
export default class MdiPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiConsole = mdiConsole
    mdiSend = mdiSend
    mdiReplay = mdiReplay

    data() {
        return {
            gCodeInput: '',
            sending: false,
            commandHistory: [] as string[],
        }
    }

    sendCommand() {
        const command = this.gCodeInput.trim()
        if (!command) return

        this.sending = true
        
        // Add to history (max 10 commands)
        if (!this.commandHistory.includes(command)) {
            this.commandHistory.unshift(command)
            if (this.commandHistory.length > 10) {
                this.commandHistory.pop()
            }
        } else {
            // Move to front if already exists
            this.commandHistory = [
                command,
                ...this.commandHistory.filter(c => c !== command),
            ]
        }

        // Send the command
        this.doSend(command)
        this.gCodeInput = ''
        
        // Simulate send delay
        setTimeout(() => {
            this.sending = false
        }, 200)
    }

    repeatCommand(command: string) {
        this.gCodeInput = command
        this.$nextTick(() => {
            this.sendCommand()
        })
    }

    clearHistory() {
        this.commandHistory = []
    }
}
</script>

<style scoped>
.command-history {
    max-height: 300px;
    overflow-y: auto;
}

.command-item {
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.6, 1);
}

.command-item:hover {
    cursor: pointer;
}

.gap-2 {
    gap: 8px;
}
</style>
