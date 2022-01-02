<style scoped>

.consoleScrollContainer {
    min-height: 200px;
    height: calc(var(--app-height) - 180px);
}

.gcode-command-field {
    font-family: 'Roboto Mono', monospace;
}
</style>

<template>
    <div class="d-flex flex-column">
        <v-row :class="this.consoleDirection === 'table' ? 'order-0' : 'order-1 mt-3'">
            <v-col>
                <v-textarea
                    v-model="gcode"
                    :items="items"
                    :label="$t('Console.SendCode')"
                    solo
                    class="gcode-command-field"
                    ref="gcodeCommandField"
                    autocomplete="off"
                    no-resize
                    auto-grow
                    :rows="rows"
                    @keydown.enter.prevent.stop="doSend"
                    @keyup.up="onKeyUp"
                    @keyup.down="onKeyDown"
                    @keydown.tab="getAutocomplete"
                    hide-details
                    outlined
                    dense
                    :prepend-icon="isTouchDevice ? 'mdi-chevron-double-right' : ''"
                    @click:prepend="getAutocomplete"
                    append-icon="mdi-send"
                    @click:append="doSend"
                ></v-textarea>
            </v-col>

            <v-col class="col-auto d-flex align-center">
                <command-help-modal
                    @onCommand="gcode = $event"
                ></command-help-modal>
                <v-menu offset-y :top="consoleDirection === 'shell'" :close-on-content-click="false" :title="$t('Console.SetupConsole')">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn class="ml-3 px-2 minwidth-0" color="lightgray" v-bind="attrs" v-on="on"><v-icon>mdi-filter</v-icon></v-btn>
                    </template>
                    <v-list>
                        <v-list-item class="minHeight36">
                            <v-checkbox class="mt-0" v-model="hideWaitTemperatures" hide-details :label="$t('Console.HideTemperatures')"></v-checkbox>
                        </v-list-item>
                        <v-list-item class="minHeight36" v-if="moonrakerComponents.includes('timelapse')">
                            <v-checkbox class="mt-0" v-model="hideTlCommands" hide-details :label="$t('Console.HideTimelapse')"></v-checkbox>
                        </v-list-item>
                        <v-list-item class="minHeight36" v-for="(filter, index) in customFilters" v-bind:key="index">
                            <v-checkbox class="mt-0" v-model="filter.bool" @change="toggleFilter(filter)" hide-details :label="filter.name"></v-checkbox>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
        <v-row :class="this.consoleDirection === 'table' ? 'order-1' : 'order-0 mt-0'">
            <v-col :class="this.consoleDirection === 'table' ? 'col' : 'col pt-0'">
                <v-card>
                    <v-card-text class="pa-0">
                        <overlay-scrollbars ref="consoleScroll" class="consoleScrollContainer d-flex flex-column">
                            <console-table ref="console"
                                           :is-mini="false"
                                           :events="events"
                                           @command-click="commandClick"
                            />
                        </overlay-scrollbars>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import {CommandHelp, VTextareaType} from '@/store/printer/types'
import {reverseString, strLongestEqual} from '@/plugins/helpers'
import CommandHelpModal from '@/components/CommandHelpModal.vue'

@Component({
    components: {
        CommandHelpModal,
        ConsoleTable,
    }
})
export default class PageConsole extends Mixins(BaseMixin) {
    private gcode = ''
    private lastCommandNumber: number | null = null
    private items = []

    $refs!: {
        gcodeCommandField: VTextareaType,
        console: ConsoleTable,
        consoleScroll: any
    }

    get helplist(): CommandHelp[] {
        return this.$store.state.printer.helplist ?? []
    }

    get consoleDirection() {
        return this.$store.state.gui.console.direction ?? 'table'
    }

    get events() {
        return this.$store.getters['server/getConsoleEvents'](this.consoleDirection === 'table')
    }

    @Watch('events')
    eventsChanged() {
        if (this.consoleDirection === 'shell') {
            setTimeout(() => {
                this.scrollToBottom()
            }, 50)
        }
    }

    get hideWaitTemperatures(): boolean {
        return this.$store.state.gui.console.hideWaitTemperatures
    }

    set hideWaitTemperatures(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'console.hideWaitTemperatures', value: newVal })
    }

    get hideTlCommands(): boolean {
        return this.$store.state.gui.console.hideWaitTemperatures
    }

    set hideTlCommands(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'console.hideTlCommands', value: newVal })
    }

    get rows(): number {
        return this.gcode?.split('\n').length ?? 1
    }

    get customFilters(): any[] {
        return this.$store.state.gui.console.consolefilters
    }

    get lastCommands(): string[] {
        return this.$store.state.gui.gcodehistory.entries ?? []
    }

    commandClick(msg: string): void {
        this.gcode = msg

        this.$nextTick(() => {
            this.$refs.gcodeCommandField.focus()
        })
    }

    doSend(cmd: KeyboardEvent): void {
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
                        behavior: 'smooth'
                    })
                }, 20)
            }
        } else this.gcode += '\n'
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
        if (this.lastCommandNumber !== null && this.lastCommandNumber < (this.lastCommands.length - 1)) {
            this.lastCommandNumber++
            this.gcode = this.lastCommands[this.lastCommandNumber]
        } else if (this.lastCommandNumber !== null && this.lastCommandNumber === (this.lastCommands.length - 1)) {
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
            const currentEndPos = sentence.indexOf('\n', currentLinePos) > -1 ? sentence.indexOf('\n', currentLinePos) - 1 : Number.MAX_SAFE_INTEGER
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
            } else if(commands?.length > 1) {
                let commands = this.helplist.filter((element) => element.commandLow.startsWith(check.toLowerCase()))
                if (this.rows > 1) {
                    this.gcode = this.gcode.replace(check, commands.reduce((acc, val) => {
                        return strLongestEqual(acc, val.command)
                    }, commands[0].command))
                } else {
                    this.gcode = commands.reduce((acc, val) => {
                        return strLongestEqual(acc, val.command)
                    }, commands[0].command)
                }
                if (commands && commands.length) {
                    let output = ''
                    commands.forEach(command => output += '<a class=\'command blue--text\'>'+command.command+'</a>: '+command.description+'<br />')

                    this.$store.dispatch('server/addEvent', { message: output, type: 'autocomplete' })
                }
            }
        }
        this.$refs.gcodeCommandField.focus()
    }

    toggleFilter(filter: string): void {
        this.$store.dispatch('gui/updateConsoleFilter',  filter)
    }

    mounted() {
        if (this.consoleDirection === 'shell') this.scrollToBottom()
    }

    scrollToBottom() {
        this.$nextTick(() => {
            if (this.$refs.consoleScroll) {
                const overlayscroll = this.$refs.consoleScroll.osInstance()
                overlayscroll?.scroll({ y: '100%' })
            }
        })
    }
}
</script>
