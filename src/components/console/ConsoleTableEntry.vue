<style scoped lang="scss">
    .consoleTableRow {
        font-family: 'Roboto Mono', monospace;
        font-size: .95em;

        &+.consoleTableRow .col {
            border-top: 1px solid rgba(255, 255, 255, 0.12);
        }
    }
</style>

<template>
    <v-row class="ma-0">
        <v-col class="col-auto pr-0 py-2">{{ event.formatTime }}</v-col>
        <v-col class="py-2" :class="colorConsoleMessage(event)" v-html="event.formatMessage" @click.capture="commandClick"></v-col>
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import Vue from 'vue'
import {Prop} from 'vue-property-decorator'
import {ServerStateEvent} from '@/store/server/types'

@Component
export default class ConsoleTableEntry extends Vue {
    @Prop({ required: true })
    readonly event!: ServerStateEvent

    colorConsoleMessage(item: ServerStateEvent): string {
        if (item.message.startsWith('!! ')) return 'red--text'

        return ''
    }

    commandClick(event: Event) {
        const eventTarget = event.target as Element
        if (eventTarget.localName === 'a' && eventTarget.className.indexOf('command') !== -1) {
            const command = eventTarget.innerHTML.replace(/<br>/g, '\n')

            this.$emit('command-click', command)
        }
    }
}
</script>
