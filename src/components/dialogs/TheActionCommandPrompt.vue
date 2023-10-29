<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="headline"
            :icon="mdiInformation"
            card-class="action_command_prompt-dialog"
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
                    <v-row :key="index">
                        <v-col>{{ event.message }}</v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions v-if="buttonPrimary || buttonSecondary">
                <v-spacer />
                <action-command-prompt-action-button v-if="buttonSecondary" :event="buttonSecondary" type="secondary" />
                <action-command-prompt-action-button v-if="buttonPrimary" :event="buttonPrimary" type="primary" />
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick, mdiInformation } from '@mdi/js'
import { ServerStateEvent } from '@/store/server/types'
import ActionCommandPromptActionButton from '@/components/dialogs/ActionCommandPromptActionButton.vue'

@Component({
    components: { ActionCommandPromptActionButton, Panel },
})
export default class TheActionCommandPrompt extends Mixins(BaseMixin) {
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
        const allowedTypes = ['button', 'text']

        return this.activePrompt.filter((event: ServerStateEvent) => {
            let type = event.message.replace('// action:prompt_', '').split(' ')[0].trim()

            return allowedTypes.includes(type)
        })
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
