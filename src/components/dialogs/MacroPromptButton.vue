<template>
    <v-btn :color="color" class="mx-2" @click="sendCommand">{{ text }}</v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPromptContent } from '@/store/server/types'

@Component({})
export default class MacroPromptButton extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly event!: ServerStateEventPromptContent

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

    sendCommand() {
        window.console.log('send command: ', this.command)
    }
}
</script>
