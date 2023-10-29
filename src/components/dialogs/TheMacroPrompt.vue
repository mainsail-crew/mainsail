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
                    <macro-prompt-text v-if="event.type === 'text'" :key="index" :event="event" />
                    <macro-prompt-button-group
                        v-if="event.type === 'button_group'"
                        :key="index"
                        :children="event.children ?? []" />
                    <macro-prompt-button-group v-if="event.type === 'button'" :key="index" :children="[event]" />
                </template>
            </v-card-text>
            <v-card-actions v-if="buttonPrimary || buttonSecondary">
                <v-spacer />
                <macro-prompt-action-button v-if="buttonSecondary" :event="buttonSecondary" type="secondary" />
                <macro-prompt-action-button v-if="buttonPrimary" :event="buttonPrimary" type="primary" />
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick, mdiInformation } from '@mdi/js'
import { ServerStateEvent, ServerStateEventPromptContent } from '@/store/server/types'
import MacroPromptActionButton from '@/components/dialogs/MacroPromptActionButton.vue'
import MacroPromptText from '@/components/dialogs/MacroPromptText.vue'
import MacroPromptButton from '@/components/dialogs/MacroPromptButton.vue'

@Component({
    components: { MacroPromptButton, MacroPromptText, MacroPromptActionButton, Panel },
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

    get lastPromptBeginPos() {
        if (this.lastPromptShowPos === -1) return -1

        return this.actions.findLastIndex(
            (event: ServerStateEvent) => event.message.startsWith('// action:prompt_begin'),
            this.lastPromptShowPos
        )
    }

    get lastPromptShowPos() {
        return this.actions.findLastIndex((event: ServerStateEvent) =>
            event.message.startsWith('// action:prompt_show')
        )
    }

    get lastPromptClosePos() {
        return this.actions.findLastIndex((event: ServerStateEvent) =>
            event.message.startsWith('// action:prompt_close')
        )
    }

    get showDialog() {
        if (this.lastPromptBeginPos === -1) return false

        return this.lastPromptBeginPos > this.lastPromptClosePos
    }

    get activePrompt() {
        if (this.lastPromptShowPos === -1) return []

        return this.actions.slice(this.lastPromptBeginPos, this.lastPromptShowPos)
    }

    get activePromptContent() {
        const allowedTypes = ['button', 'text', 'button_group_start', 'button_group_end']
        const activePromptContent: ServerStateEventPromptContent[] = this.activePrompt.map(
            (event: ServerStateEvent) => {
                const type = event.message.replace('// action:prompt_', '').split(' ')[0].trim()
                const message = (event.message ?? '').replace(`// action:prompt_${type}`, '').replace(/"/g, '').trim()

                const promptContent: ServerStateEventPromptContent = {
                    date: event.date,
                    type,
                    message,
                }

                return promptContent
            }
        )

        const output = activePromptContent.filter((event: ServerStateEventPromptContent) =>
            allowedTypes.includes(event.type)
        )

        while (output.findIndex((event) => event.type === 'button_group_start') !== -1) {
            const start = output.findIndex((event) => event.type === 'button_group_start')
            const end = output.findIndex((event) => event.type === 'button_group_end')

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

        return (this.actions[this.lastPromptBeginPos].message ?? '')
            .replace('// action:prompt_begin', '')
            .replace(/"/g, '')
            .trim()
    }

    get buttonPrimary() {
        const index = this.activePrompt.findLastIndex((event: ServerStateEvent) =>
            event.message.startsWith('// action:prompt_button_primary')
        )

        if (index === -1) return null

        return this.activePrompt[index]
    }

    get buttonSecondary() {
        const index = this.activePrompt.findLastIndex((event: ServerStateEvent) =>
            event.message.startsWith('// action:prompt_button_secondary')
        )

        if (index === -1) return null

        return this.activePrompt[index]
    }

    closePrompt() {
        const gcode = `RESPOND type="command" msg="action:prompt_close"`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped></style>
