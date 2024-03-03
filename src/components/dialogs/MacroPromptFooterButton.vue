<template>
    <v-btn :color="color" text @click="clickButton">
        {{ text }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'

@Component({})
export default class MacroPromptActionButton extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly event!: ServerStateEventPrompt

    get splits() {
        return this.event.message.split('|')
    }

    get text() {
        return this.splits[0]
    }

    get command() {
        return this.splits[1] ?? this.text
    }

    get color() {
        return this.splits[2] ?? ''
    }

    clickButton() {
        this.$store.dispatch('server/addEvent', { message: this.command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.command })
    }
}
</script>

<style scoped></style>
