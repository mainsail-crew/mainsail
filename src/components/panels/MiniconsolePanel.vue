<template>
    <panel
        v-if="socketIsConnected && klipperState !== 'disconnected'"
        :icon="mdiConsoleLine"
        :title="$t('Panels.MiniconsolePanel.Headline')"
        :collapsible="true"
        card-class="miniconsole-panel"
        :hide-buttons-on-collapse="true">
        <template #buttons>
            <v-btn icon tile @click="clearConsole">
                <v-icon small>{{ mdiTrashCan }}</v-icon>
            </v-btn>
            <command-help-modal :in-toolbar="true" @onCommand="gcode = $event" />
            <v-menu
                :offset-y="true"
                :close-on-content-click="false"
                :title="$t('Panels.MiniconsolePanel.SetupConsole')">
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon small>{{ mdiCog }}</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-if="consoleDirection === 'shell'" class="minHeight36">
                        <v-checkbox
                            v-model="autoscroll"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.Autoscroll')" />
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox
                            v-model="hideWaitTemperatures"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTemperatures')" />
                    </v-list-item>
                    <v-list-item v-if="moonrakerComponents.includes('timelapse')" class="minHeight36">
                        <v-checkbox
                            v-model="hideTlCommands"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTimelapse')" />
                    </v-list-item>
                    <v-list-item v-for="(filter, index) in customFilters" :key="index" class="minHeight36">
                        <v-checkbox
                            v-model="filter.bool"
                            class="mt-0"
                            hide-details
                            :label="filter.name"
                            @change="toggleFilter(filter)" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <div class="d-flex flex-column">
            <v-card-text :class="consoleDirection === 'table' ? 'order-1' : 'order-2'">
                <v-textarea
                    ref="gcodeCommandField"
                    v-model="gcode"
                    :items="items"
                    :label="$t('Panels.MiniconsolePanel.SendCode')"
                    solo
                    class="gcode-command-field"
                    autocomplete="off"
                    no-resize
                    auto-grow
                    :rows="rows"
                    hide-details
                    outlined
                    dense
                    :prepend-icon="isTouchDevice ? mdiChevronDoubleRight : ''"
                    :append-icon="mdiSend"
                    @keydown.enter.prevent.stop="doSend"
                    @keyup.up="onKeyUp"
                    @keyup.down="onKeyDown"
                    @keydown.tab="getAutocomplete"
                    @click:prepend="getAutocomplete"
                    @click:append="doSend"></v-textarea>
            </v-card-text>
            <v-card-text :class="(consoleDirection === 'table' ? 'order-2' : 'order-1') + ' pa-0'">
                <v-row>
                    <v-col>
                        <overlay-scrollbars
                            ref="miniConsoleScroll"
                            :style="'height: ' + consoleHeight + 'px;'"
                            :options="{}">
                            <console-table
                                ref="console"
                                :events="events"
                                :is-mini="true"
                                @command-click="commandClick" />
                            <v-divider />
                        </overlay-scrollbars>
                    </v-col>
                </v-row>
            </v-card-text>
        </div>
    </panel>
</template>

<script lang="ts">
import { strLongestEqual, reverseString } from '@/plugins/helpers'
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { CommandHelp, VTextareaType } from '@/store/printer/types'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiChevronDoubleRight, mdiCog, mdiConsoleLine, mdiSend, mdiTrashCan } from '@mdi/js'
import CommandHelpModal from '@/components/CommandHelpModal.vue'

@Component({
    components: {
        Panel,
        ConsoleTable,
        CommandHelpModal,
    },
})
export default class MiniconsolePanel extends Mixins(BaseMixin) {
    mdiTrashCan = mdiTrashCan
    mdiConsoleLine = mdiConsoleLine
    mdiCog = mdiCog
    mdiSend = mdiSend
    mdiChevronDoubleRight = mdiChevronDoubleRight

    declare $refs: {
        gcodeCommandField: VTextareaType
        console: ConsoleTable
        miniConsoleScroll: any
    }

    private gcode = ''
    private lastCommandNumber: number | null = null
    private items = []
    private cmdListSearch: string | null = null

    get helplist(): CommandHelp[] {
        return this.$store.state.printer.helplist ?? []
    }

    get consoleDirection() {
        return this.$store.state.gui.console.direction ?? 'table'
    }

    get consoleHeight() {
        return this.$store.state.gui.console.height ?? 300
    }

    get events() {
        return this.$store.getters['server/getConsoleEvents'](this.consoleDirection === 'table', 250)
    }

    @Watch('events')
    eventsChanged() {
        if (this.consoleDirection === 'shell' && this.autoscroll) {
            setTimeout(() => {
                this.scrollToBottom()
            }, 50)
        }
    }

    @Watch('autoscroll')
    autoscrollChanged(newVal: boolean) {
        if (newVal) this.scrollToBottom()
    }

    clearConsole() {
        this.$store.dispatch('gui/console/clear')
    }

    get hideWaitTemperatures(): boolean {
        return this.$store.state.gui.console.hideWaitTemperatures
    }

    set hideWaitTemperatures(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'console.hideWaitTemperatures', value: newVal })
    }

    get hideTlCommands(): boolean {
        return this.$store.state.gui.console.hideTlCommands
    }

    set hideTlCommands(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'console.hideTlCommands', value: newVal })
    }

    get customFilters(): any[] {
        return this.$store.state.gui.console.consolefilters
    }

    get rows(): number {
        return this.gcode?.split('\n').length ?? 1
    }

    get lastCommands(): string[] {
        return this.$store.state.gui.gcodehistory.entries ?? []
    }

    get autoscroll(): boolean {
        return this.$store.state.gui.console.autoscroll ?? true
    }

    set autoscroll(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'console.autoscroll', value: newVal })
    }

    commandClick(msg: string): void {
        this.gcode = msg

        this.$nextTick(() => {
            this.$refs.gcodeCommandField.focus()
        })
    }

    doSend(cmd: KeyboardEvent) {
        if (!cmd.shiftKey) {
            if (this.gcode !== '') {
                this.$store.dispatch('printer/sendGcode', this.gcode)
                this.$store.dispatch('gui/gcodehistory/addToHistory', this.gcode)
                this.gcode = ''
                this.lastCommandNumber = null
                setTimeout(() => {
                    this.$refs.console.$el.scroll({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    })
                }, 20)
            }
        } else {
            this.gcode += '\n'
        }
    }

    onKeyUp(): void {
        if (this.lastCommandNumber === null && this.lastCommands.length) {
            this.lastCommandNumber = this.lastCommands.length - 1
            this.gcode = this.lastCommands[this.lastCommandNumber]
        } else if (this.lastCommandNumber && this.lastCommandNumber > 0) {
            this.lastCommandNumber--
            this.gcode = this.lastCommands[this.lastCommandNumber]
        }
    }

    onKeyDown(): void {
        if (this.lastCommandNumber !== null && this.lastCommandNumber < this.lastCommands.length - 1) {
            this.lastCommandNumber++
            this.gcode = this.lastCommands[this.lastCommandNumber]
        } else if (this.lastCommandNumber !== null && this.lastCommandNumber === this.lastCommands.length - 1) {
            this.lastCommandNumber = null
            this.gcode = ''
        }
    }

    getAutocomplete(e: Event): void {
        e.preventDefault()
        if (this.gcode.length) {
            let check = this.gcode.toLowerCase()
            const textarea = this.$refs.gcodeCommandField.$refs.input
            const sentence = textarea.value
            const len = sentence.length
            const pos = textarea.selectionStart
            const currentLinePos = len - reverseString(sentence).indexOf('\n', len - pos)
            const currentEndPos =
                sentence.indexOf('\n', currentLinePos) > -1
                    ? sentence.indexOf('\n', currentLinePos) - 1
                    : Number.MAX_SAFE_INTEGER
            if (this.rows > 1) {
                check = sentence.substr(currentLinePos, currentEndPos - currentLinePos)
            }
            let commands = this.helplist.filter((element) => element.commandLow.startsWith(check.toLowerCase()))
            if (commands?.length === 1) {
                if (this.rows > 1) {
                    this.gcode = this.gcode.replace(check, commands[0].command)
                } else {
                    this.gcode = commands[0].command
                }
            } else if (commands?.length > 1) {
                let commands = this.helplist.filter((element) => element.commandLow.startsWith(check.toLowerCase()))
                if (this.rows > 1) {
                    this.gcode = this.gcode.replace(
                        check,
                        commands.reduce((acc, val) => {
                            return strLongestEqual(acc, val.command)
                        }, commands[0].command)
                    )
                } else {
                    this.gcode = commands.reduce((acc, val) => {
                        return strLongestEqual(acc, val.command)
                    }, commands[0].command)
                }
                if (commands && commands.length) {
                    let output = ''
                    commands.forEach(
                        (command) =>
                            (output +=
                                '<a class="command font-weight-bold">' +
                                command.command +
                                '</a>: ' +
                                command.description +
                                '<br />')
                    )

                    this.$store.dispatch('server/addEvent', { message: output, type: 'autocomplete' })
                }
            }
        }
        this.$refs.gcodeCommandField.focus()
    }

    toggleFilter(filter: string) {
        this.$store.dispatch('gui/updateConsoleFilter', filter)
    }

    mounted() {
        if (this.consoleDirection === 'shell') this.scrollToBottom()
    }

    scrollToBottom() {
        this.$nextTick(() => {
            if (this.$refs.miniConsoleScroll) {
                const overlayscroll = this.$refs.miniConsoleScroll.osInstance()
                overlayscroll?.scroll({ y: '100%' })
            }
        })
    }

    scrollToTop() {
        this.$nextTick(() => {
            if (this.$refs.miniConsoleScroll) {
                const overlayscroll = this.$refs.miniConsoleScroll.osInstance()
                overlayscroll?.scroll({ y: '0%' })
            }
        })
    }
}
</script>

<style scoped>
.consoleTable {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

html.theme--light .consoleTable {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.gcode-command-field {
    font-family: 'Roboto Mono', monospace;
}
</style>
