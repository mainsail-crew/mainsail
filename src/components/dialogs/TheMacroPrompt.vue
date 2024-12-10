<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="headline"
            :icon="mdiInformation"
            card-class="macro_prompt-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <template v-for="(event, index) in activePromptContent">
                    <macro-prompt-text v-if="event.type === 'text'" :key="'prompt_' + index" :event="event" />
                    <macro-prompt-button-group
                        v-if="event.type === 'button_group'"
                        :key="'prompt_' + index"
                        :group-index="index"
                        :children="event.children ?? []" />
                    <macro-prompt-button-group
                        v-if="event.type === 'button'"
                        :key="'prompt_' + index"
                        :group-index="index"
                        :children="[event]" />
                </template>
            </v-card-text>
            <v-card-actions v-if="footerButtons.length">
                <v-spacer />
                <macro-prompt-footer-button
                    v-for="(button, index) in footerButtons"
                    :key="'prompt_footer_' + index"
                    :event="button" />
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick, mdiInformation } from '@mdi/js'
import { ServerStateEvent, ServerStateEventPrompt } from '@/store/server/types'
import MacroPromptFooterButton from '@/components/dialogs/MacroPromptFooterButton.vue'
import MacroPromptText from '@/components/dialogs/MacroPromptText.vue'
import MacroPromptButton from '@/components/dialogs/MacroPromptButton.vue'
import MacroPromptButtonGroup from '@/components/dialogs/MacroPromptButtonGroup.vue'

@Component({
    components: { MacroPromptButtonGroup, MacroPromptButton, MacroPromptText, MacroPromptFooterButton, Panel },
})
export default class TheMacroPrompt extends Mixins(BaseMixin) {
    mdiInformation = mdiInformation
    mdiCloseThick = mdiCloseThick

    private internalCloseCommand: number | null = null
    private checkpointEvent: ServerStateEvent | null = null
    private currentPrompt: ServerStateEventPrompt[] = []
    // regex that extracts the type and message, omitting the wrapping double quotes of the message (if any)
    private promptMessageExp = /^\/\/ action:prompt_(?<type>[^\s]+) *(?<msg>.*)$/

    get events() {
        return this.$store.state.server.events
    }

    get macroPromptEvents() {
        const events: ServerStateEvent[] = this.events
        const promptEvents: ServerStateEventPrompt[] = []
        // process events from most recent (end of array) to oldest (beginning of array) event until we reach
        // the events we have already processed
        for (let i = events.length - 1; i >= 0; i--) {
            const event = events[i]
            // if we've reached the checkpoint event (i.e. the point where we know there are no earlier prompts to process)
            if (event === this.checkpointEvent) {
                // break the loop
                break
            }

            // not a prompt action, skip it
            if (event.type !== 'action' || !event.message?.startsWith('// action:prompt_')) {
                continue
            }

            const match = event.message.match(this.promptMessageExp)
            const type = match?.groups?.type ?? ''

            // stop processing and clear events once we find an end action
            if (type === 'end') {
                this.currentPrompt = []
                break
            }

            const message = (match?.groups?.msg || '').trim()

            // prepend the event to prompt events found in this chunk
            promptEvents.unshift({
                date: event.date,
                type,
                message,
            })

            // stop processing events once we find a begin action
            if (type === 'begin') {
                this.currentPrompt = []
                break
            }
        }

        // save our checkpoint event...we'll never have to look at messages prior to the checkpoint again
        this.checkpointEvent = events[events.length - 1]

        // if we found new prompt events in this chunk, let's append them
        if (promptEvents.length > 0) {
            this.currentPrompt = [...this.currentPrompt, ...promptEvents]
        }

        return this.currentPrompt
    }

    get lastPromptBeginPos() {
        if (this.lastPromptShowPos === -1) return -1

        return this.macroPromptEvents.findLastIndex(
            (event: ServerStateEventPrompt) => event.type === 'begin',
            this.lastPromptShowPos
        )
    }

    get lastPromptShowPos() {
        return this.macroPromptEvents.findLastIndex((event: ServerStateEventPrompt) => event.type === 'show')
    }

    get lastPromptClosePos() {
        return this.macroPromptEvents.findLastIndex((event: ServerStateEventPrompt) => event.type === 'end')
    }

    get showDialog() {
        if (this.lastPromptBeginPos === -1) return false

        const lastBeginEvent = this.macroPromptEvents[this.lastPromptBeginPos] ?? null
        if (
            this.internalCloseCommand !== null &&
            this.internalCloseCommand == (lastBeginEvent?.date?.getTime() ?? null)
        )
            return false

        return this.lastPromptBeginPos > this.lastPromptClosePos && this.activePromptContent.length > 0
    }

    get activePrompt() {
        if (this.lastPromptShowPos === -1) return []

        return this.macroPromptEvents.slice(this.lastPromptBeginPos, this.lastPromptShowPos)
    }

    get activePromptContent(): ServerStateEventPrompt[] {
        const allowedTypes = ['button', 'text', 'button_group_start', 'button_group_end']

        const output = this.activePrompt.filter((event: ServerStateEventPrompt) => allowedTypes.includes(event.type))

        while (
            output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_start') !== -1 &&
            output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_end') !== -1
        ) {
            const start = output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_start')
            const end = output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_end')

            const buttons = output.slice(start + 1, end)

            output[start] = {
                date: buttons[0].date,
                type: 'button_group',
                message: '',
                children: buttons.filter((event: ServerStateEventPrompt) => event.type === 'button'),
            }

            output.splice(start + 1, buttons.length + 1)
        }

        return output
    }

    get headline() {
        if (!this.showDialog || this.lastPromptBeginPos === -1) return ''

        return this.macroPromptEvents[this.lastPromptBeginPos]?.message ?? ''
    }

    get footerButtons() {
        if (!this.showDialog || this.lastPromptBeginPos === -1) return []

        return this.activePrompt.filter((event: ServerStateEventPrompt) => event.type === 'footer_button')
    }

    closePrompt() {
        // close prompt immediately, because klipper could be busy
        this.internalCloseCommand = this.macroPromptEvents[this.lastPromptBeginPos]?.date?.getTime() ?? null

        const gcode = `RESPOND type="command" msg="action:prompt_end"`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped></style>
