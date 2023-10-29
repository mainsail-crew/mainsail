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

@Component({
    components: { MacroPromptButton, MacroPromptText, MacroPromptFooterButton, Panel },
})
export default class TheMacroPrompt extends Mixins(BaseMixin) {
    mdiInformation = mdiInformation
    mdiCloseThick = mdiCloseThick

    get events() {
        return this.$store.state.server.events
    }

    get actions() {
        return this.events.filter((event: ServerStateEvent) => event.type === 'action')
    }

    get macroPromptEvents() {
        return this.actions
            .filter((event: ServerStateEvent) => event.message.startsWith('// action:prompt_'))
            .map((event: ServerStateEvent) => {
                const type = event.message.replace('// action:prompt_', '').split(' ')[0].trim()
                const message = (event.message ?? '').replace(`// action:prompt_${type}`, '').replace(/"/g, '').trim()

                const promptContent: ServerStateEventPromptContent = {
                    date: event.date,
                    type,
                    message,
                }

                return promptContent
            })
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
        return this.macroPromptEvents.findLastIndex((event: ServerStateEventPrompt) => event.type === 'close')
    }

    get showDialog() {
        if (this.lastPromptBeginPos === -1) return false

        return this.lastPromptBeginPos > this.lastPromptClosePos
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
                children: buttons,
            }

            output.splice(start + 1, buttons.length + 1)
        }

        return output
    }

    get headline() {
        if (!this.showDialog || this.lastPromptBeginPos === -1) return ''

        return this.activePrompt[this.lastPromptBeginPos].message ?? ''
    }

    get footerButtons() {
        if (!this.showDialog || this.lastPromptBeginPos === -1) return []

        return this.activePrompt.filter((event: ServerStateEventPrompt) => event.type === 'footer_button')
    }

    closePrompt() {
        const gcode = `RESPOND type="command" msg="action:prompt_close"`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped></style>
