<template>
    <v-row>
        <v-col>
            <v-text-field
                v-model="value"
                :placeholder="placeholder"
                hide-details
                outlined
                dense
                :label="label"
                @keydown="send" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'
import { Debounce } from 'vue-debounce-decorator'

@Component({})
export default class MacroPromptInput extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly event!: ServerStateEventPrompt

    value = ''

    get splits() {
        return this.event.message.split('|')
    }

    get label() {
        return this.splits[0] ?? null
    }

    get macro() {
        return this.splits[1] ?? null
    }

    get variable() {
        return this.splits[2] ?? null
    }

    get default() {
        return this.splits[3] ?? ''
    }

    get placeholder() {
        return this.splits[4] ?? ''
    }

    mounted() {
        this.value = this.default
    }

    @Debounce(500)
    send() {
        const command = `SET_GCODE_VARIABLE MACRO=${this.macro} VARIABLE=${this.variable} VALUE='"${this.value}"'`

        this.$store.dispatch('server/addEvent', { message: command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: command })
    }
}
</script>
