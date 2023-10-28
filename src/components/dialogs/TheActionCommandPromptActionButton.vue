<template>
    <v-btn :color="color" text @click="clickButton">
        {{ text }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEvent } from '@/store/server/types'

@Component({})
export default class TheActionCommandPromptActionButton extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly event!: ServerStateEvent
    @Prop({ type: String, required: true }) readonly type!: 'primary' | 'secondary'

    get filtertedMessageSplits() {
        return (this.event.message ?? '')
            .replace(`// action:prompt_button_${this.type}`, '')
            .replace(/"/g, '')
            .trim()
            .split('|')
    }

    get text() {
        return this.filtertedMessageSplits[0]
    }

    get command() {
        return this.filtertedMessageSplits[1] ?? this.text
    }

    get color() {
        return this.type === 'primary' ? 'primary' : ''
    }

    clickButton() {
        this.$store.dispatch('server/addEvent', { message: this.command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.command })
    }
}
</script>

<style scoped></style>
