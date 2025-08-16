<template>
    <v-alert v-if="message" :icon="mdiAlert" :type="type" class="mt-3 align-content-center" dense text>
        <v-row>
            <v-col class="grow text-format">{{ message }}</v-col>
            <v-col class="shrink py-0 align-content-center">
                <v-btn icon @click="clearMessage">
                    <v-icon small>{{ mdiClose }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-alert>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { mdiAlert, mdiClose } from '@mdi/js'

@Component
export default class AfcPanelMessage extends Mixins(BaseMixin, AfcMixin) {
    mdiAlert = mdiAlert
    mdiClose = mdiClose

    get type() {
        const type = this.afc.message?.type ?? 'error'
        const possibleTypes = ['info', 'warning', 'success', 'error']

        if (!possibleTypes.includes(type)) {
            window.console.warn(`AfcPanelMessage: Invalid message type "${type}" detected. Defaulting to "error".`)
            return 'error'
        }

        return type
    }

    get message() {
        return this.afc.message?.message ?? ''
    }

    clearMessage() {
        const gcode = `AFC_CLEAR_MESSAGE`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped>
.text-format {
    white-space: break-spaces;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.875rem;
}
</style>
