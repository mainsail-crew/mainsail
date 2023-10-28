<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="headline"
            :icon="mdiArrowCollapseDown"
            card-class="manual_probe-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>{{ activePrompt.length }}</v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text>
                    {{ $t('BedScrews.Abort') }}
                </v-btn>
                <v-btn color="primary" text>
                    {{ $t('BedScrews.Adjusted') }}
                </v-btn>
                <v-btn color="primary" text>
                    {{ $t('BedScrews.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'

import { mdiArrowCollapseDown, mdiInformation, mdiCloseThick } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'
import { ServerStateEvent } from '@/store/server/types'
@Component({
    components: { Panel, Responsive },
})
export default class TheActionCommandPrompt extends Mixins(BaseMixin, ControlMixin) {
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiInformation = mdiInformation
    mdiCloseThick = mdiCloseThick

    get events() {
        return this.$store.state.server.events
    }

    get actions() {
        return this.events.filter((event: ServerStateEvent) => event.type === 'action')
    }

    get lastPromptStartPos() {
        if (this.lastPromptShowPos === -1) return -1

        return this.actions.lastIndexOf(
            (event: ServerStateEvent) => event.message.startsWith('action:prompt_start'),
            this.lastPromptShowPos
        )
    }

    get lastPromptShowPos() {
        return this.actions.lastIndexOf((event: ServerStateEvent) => event.message.startsWith('action:prompt_show'))
    }

    get lastPromptClosePos() {
        return this.actions.lastIndexOf((event: ServerStateEvent) => event.message.startsWith('action:prompt_close'))
    }

    get showDialog() {
        if (this.lastPromptStartPos === -1) return false

        return this.lastPromptStartPos > this.lastPromptClosePos
    }

    get activePrompt() {
        if (this.lastPromptShowPos === -1) return []

        const events = this.actions.slice(this.lastPromptStartPos, this.lastPromptShowPos)
        window.console.log(events)

        return events
    }

    get headline() {
        return 'Bla bla headline'
    }

    closePrompt() {
        const gcode = `RESPOND type="action" msg="action:prompt_close"`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    sendAdjusted() {
        const gcode = `ADJUSTED`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'manualProbeAccept' })
    }
}
</script>

<style scoped></style>
