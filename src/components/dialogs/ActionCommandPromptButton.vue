<template>
    <v-row>
        <v-col>
            <v-btn @click="sendCommand">{{ text }}</v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPromptContent } from '@/store/server/types'

@Component({})
export default class ActionCommandPromptButton extends Mixins(BaseMixin) {
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

    sendCommand() {
        window.console.log('send command: ', this.command)
    }
}
</script>
