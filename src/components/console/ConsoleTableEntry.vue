<template>
    <v-row :class="entryStyle">
        <v-col class="col-auto pr-0 text--disabled console-time">{{ entryFormatTime }}</v-col>
        <v-col :class="messageClass" style="min-width: 0" @click.capture="commandClick" v-html="event.formatMessage" />
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import { ServerStateEvent } from '@/store/server/types'
import BaseMixin from '@/components/mixins/base'

@Component
export default class ConsoleTableEntry extends Mixins(BaseMixin) {
    @Prop({ required: true })
    declare readonly event: ServerStateEvent

    get entryStyle() {
        const classes = ['ma-0', 'flex-nowrap']
        classes.push(this.$store.state.gui.console.entryStyle ?? 'default')
        if (this.event.type === 'action') classes.push('text--disabled')

        return classes
    }

    get entryFormatTime() {
        return this.formatTime(this.event.date.getTime(), true)
    }

    get messageClass() {
        const classes = ['console-message']

        if (this.event.type === 'action') classes.push('text--disabled')
        else if (this.event.message.startsWith('!! ')) classes.push('error--text')
        else classes.push('text--primary')

        return classes
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

<style scoped>
.consoleTableRow {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.95em;

    &.default {
        .col {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
        }

        & + .consoleTableRow .col {
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

html.theme--light .consoleTableRow.default + .consoleTableRow .col {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
