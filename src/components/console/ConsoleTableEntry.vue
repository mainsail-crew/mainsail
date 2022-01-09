<style scoped lang="scss">
    .consoleTableRow {
        font-family: 'Roboto Mono', monospace;
        font-size: .95em;

        &.default {
            .col {
                padding-top: 8px !important;
                padding-bottom: 8px !important;
            }

            &+.consoleTableRow .col {
                border-top: 1px solid rgba(255, 255, 255, 0.12);
            }
        }

        &.compact {
            .col {
                padding-top: 2px !important;
                padding-bottom: 2px !important;
            }
        }
    }
</style>

<template>
    <v-row :class="'ma-0 '+entryStyle">
        <v-col class="col-auto pr-0 text--disabled console-time">{{ event.formatTime }}</v-col>
        <v-col  :class="colorConsoleMessage(event) + ' ' + 'console-message'" v-html="event.formatMessage" @click.capture="commandClick"></v-col>
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

    get entryStyle() {
        return this.$store.state.gui.console.entryStyle ?? 'default'
    }

    colorConsoleMessage(item: ServerStateEvent): string {
        if (item.message.startsWith('!! ')) return 'error--text'

        return 'text--primary'
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
