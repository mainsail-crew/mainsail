<style scoped>

.minievent-table {
    max-height: 350px;
    overflow-y: auto;
}

.miniConsole .title-cell {
    white-space: nowrap;
    width: 1% !important;
}

.miniConsole.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    height: auto;
}

.miniConsole .content-cell {
    width: 100%;
}
</style>

<template>
    <v-card v-if="socketIsConnected">
        <v-toolbar flat dense>
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-console-line</v-icon>{{ $t("Panels.MiniconsolePanel.Console") }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <command-help-modal
                is-mini
                @onCommand="gcode = $event"
            ></command-help-modal>
<!--            <v-menu :offset-y="true" :close-on-content-click="true" max-height="98%" min-width="65%" max-width="98%" fixed top right>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn class="px-2 minwidth-0 mr-2" color="grey darken-3" small v-bind="attrs" v-on="on">
                        <v-icon small>mdi-help</v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        Command list
                    </v-card-title>
                    <div>
                        <v-text-field v-model="cmdListSearch" class="mx-4" label="Search" autofocus></v-text-field>
                        <v-list>
                            <v-list-item
                                v-for="cmd of helplistFiltered"
                                :key="cmd.commandLow"
                                class="minHeight36"
                            >
                                <span class="blue&#45;&#45;text font-weight-bold mr-2 cursor-pointer" @click="gcode = cmd.command">{{ cmd.command }}:</span>
                                <span>{{ cmd.description }}</span>
                            </v-list-item>
                        </v-list>
                    </div>
                </v-card>
            </v-menu>-->
            <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.MiniconsolePanel.SetupConsole')">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn small class="px-2 minwidth-0" color="grey darken-3" v-bind="attrs" v-on="on"><v-icon small>mdi-cog</v-icon></v-btn>
                </template>
                <v-list>
                    <v-list-item class="minHeight36">
                        <v-checkbox class="mt-0" v-model="hideWaitTemperatures" hide-details :label="$t('Panels.MiniconsolePanel.HideTemperatures')"></v-checkbox>
                    </v-list-item>
                    <v-list-item class="minHeight36" v-for="(filter, index) in customFilters" v-bind:key="index">
                        <v-checkbox class="mt-0" v-model="filter.bool" @change="toggleFilter(filter)" hide-details :label="filter.name"></v-checkbox>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-toolbar>
        <v-card-text>
            <v-container class="py-0 px-0">
                <v-row>
                    <v-col>
                        <v-textarea
                            v-model="gcode"
                            :items="items"
                            :label="$t('Panels.MiniconsolePanel.SendCode')"
                            solo
                            class="gcode-command-field"
                            ref="gcodeCommandField"
                            autocomplete="off"
                            no-resize
                            :rows="rows"
                            @keydown.enter.prevent.stop="doSend"
                            @keyup.up="onKeyUp"
                            @keyup.down="onKeyDown"
                            @keydown.tab="getAutocomplete"
                            hide-details
                        ></v-textarea>
                    </v-col>
                    <v-col class="col-auto align-content-center">
                        <v-btn color="info" class="gcode-command-btn" @click="doSend" :loading="loadings.includes('sendGcode')" :disabled="loadings.includes('sendGcode') || !gcode" >
                            <v-icon class="mr-2">mdi-send</v-icon> {{ $t("Panels.MiniconsolePanel.Send") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-text class="px-0 py-0 content">
            <v-divider></v-divider>
            <console-table ref="console"
                           :headers="headers"
                           :options="{}"
                           sort-by="date"
                           :sort-desc="true"
                           :events="events"
                           :helplist="helplist"
                           :format-time-mobile="formatTime"
                           class="minievent-table miniConsole"
                           @command-click="commandClick"
            />
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import {colorConsoleMessage, formatConsoleMessage, strLongestEqual, reverseString} from "@/plugins/helpers"
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {CommandHelp, ConsoleCommandHelp, VTextareaType} from "@/store/printer/types";
import ConsoleTable from "@/components/ConsoleTable.vue";
import CommandHelpModal from "@/components/CommandHelpModal.vue";

@Component({
    components: {
        ConsoleTable,
        CommandHelpModal
    }
})
export default class MiniconsolePanel extends Mixins(BaseMixin) {
    colorConsoleMessage = colorConsoleMessage
    formatConsoleMessage = formatConsoleMessage

    $refs!: {
        gcodeCommandField: VTextareaType,
        console: ConsoleTable
    }

    private headers = [
        {
            text: 'Date',
            value: 'date',
            width: '15%',
            dateType: 'Date',
        },
        {
            text: 'Event',
            sortable: false,
            value: 'message',
            width: '85%'
        },
    ]
    private gcode = ""
    private lastCommands: string[] = []
    private lastCommandNumber: number | null = null
    private items = [];
    private cmdListSearch: string | null = null

    get helplist(): CommandHelp[] {
        return this.$store.state.printer.helplist ?? []
    }

    get helplistFiltered(): CommandHelp[] {
        return this.helplist
            .filter(cmd => typeof(cmd.description) === "string" && (!this.cmdListSearch || cmd.commandLow.includes(this.cmdListSearch.toLowerCase())))
            .sort((a, b) => a.commandLow.localeCompare(b.commandLow));
    }

    get events() {
        return this.$store.getters['server/getFilteredEvents']
    }

    get hideWaitTemperatures(): boolean {
        return this.$store.state.gui.console.hideWaitTemperatures
    }

    set hideWaitTemperatures(newVal) {
        this.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: "console.hideWaitTemperatures", value: newVal }, { action: 'gui/updateDataFromDB' })
    }

    get customFilters(): any[] {
        return this.$store.state.gui.console.customFilters
    }

    get rows(): number {
        return this.gcode?.split('\n').length ?? 1;
    }

    commandClick(msg: ConsoleCommandHelp): void {
        this.gcode = msg.original.indexOf(":") > -1 && msg.command ? msg.command.command : msg.original;
    }

    doSend(cmd: KeyboardEvent) {
        if (!cmd.shiftKey) {
            this.$store.dispatch('printer/sendGcode', this.gcode)
            this.lastCommands.push(this.gcode)
            this.gcode = ""
            this.lastCommandNumber = null
            setTimeout(() => {
                this.$refs.console.$el.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                })
            }, 20);
        } else {
            this.gcode += '\n';
        }
    }

    onKeyUp(): void {
        if (this.lastCommandNumber === null && this.lastCommands.length) {
            this.lastCommandNumber = this.lastCommands.length - 1;
            this.gcode = this.lastCommands[this.lastCommandNumber];
        } else if (this.lastCommandNumber && this.lastCommandNumber > 0) {
            this.lastCommandNumber--;
            this.gcode = this.lastCommands[this.lastCommandNumber];
        }
    }

    onKeyDown(): void {
        if (this.lastCommandNumber !== null && this.lastCommandNumber < (this.lastCommands.length - 1)) {
            this.lastCommandNumber++;
            this.gcode = this.lastCommands[this.lastCommandNumber];
        } else if (this.lastCommandNumber !== null && this.lastCommandNumber === (this.lastCommands.length - 1)) {
            this.lastCommandNumber = null;
            this.gcode = "";
        }
    }

    getAutocomplete(e: Event): void {
        e.preventDefault();
        if (this.gcode.length) {
            let check = this.gcode.toLowerCase();
            const textarea = this.$refs.gcodeCommandField.$refs.input;
            const sentence = textarea.value;
            const len = sentence.length;
            const pos = textarea.selectionStart;
            const currentLinePos = len - reverseString(sentence).indexOf('\n', len - pos);
            const currentEndPos = sentence.indexOf('\n', currentLinePos) > -1 ? sentence.indexOf('\n', currentLinePos) - 1 : Number.MAX_SAFE_INTEGER;
            if (this.rows > 1) {
                check = sentence.substr(currentLinePos, currentEndPos - currentLinePos);
            }
            let commands = this.helplist.filter((element) => element.commandLow.startsWith(check.toLowerCase()));
            if (commands?.length === 1) {
                if (this.rows > 1) {
                    this.gcode = this.gcode.replace(check, commands[0].command);
                } else {
                    this.gcode = commands[0].command;
                }
            } else if(commands?.length > 1) {
                let commands = this.helplist.filter((element) => element.commandLow.startsWith(check.toLowerCase()));
                if (this.rows > 1) {
                    this.gcode = this.gcode.replace(check, commands.reduce((acc, val) => {
                        return strLongestEqual(acc, val.command);
                    }, commands[0].command));
                } else {
                    this.gcode = commands.reduce((acc, val) => {
                        return strLongestEqual(acc, val.command);
                    }, commands[0].command);
                }
                if (commands && commands.length) {
                    let output = "";
                    commands.forEach(command => output += "<b>"+command.command+":</b> "+command.description+"<br />");

                    this.$store.commit('server/addEvent', { message: output, type: 'autocomplete' });
                }
            }
        }
        this.$refs.gcodeCommandField.focus();
    }

    formatTime(date: Date) {
        let hours: string | number = date.getHours();
        if (hours < 10) hours = "0"+hours.toString();
        let minutes: string | number = date.getMinutes();
        if (minutes < 10) minutes = "0"+minutes.toString();
        let seconds: string | number = date.getSeconds();
        if (seconds < 10) seconds = "0"+seconds.toString();


        return hours+":"+minutes+":"+seconds;
    }

    toggleFilter(filter: string) {
        this.$store.dispatch('gui/updateConsoleFilter',  filter)
    }
}
</script>
