<style>
    .gcode-command-field {

    }

    .gcode-command-field .v-input__slot {
        margin-bottom: 0;
    }

    .gcode-command-field .v-text-field__details {
        display: none;
    }

    .gcode-command-btn {
        margin-top: 5px;
    }

    .log-cell.title-cell {
        vertical-align: top;
        height: auto !important;
    }

    .log-cell.content-cell {
        vertical-align: top;
        min-height: auto;
        height: auto !important;
    }
</style>

<template>
    <div>
        <v-row>
            <v-col class="col">
                <v-textarea
                    v-model="gcode"
                    :items="items"
                    :label="$t('Console.SendCode')"
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
                ></v-textarea>
            </v-col>

            <v-col class="col-auto align-content-center">
                <v-btn color="info" class="gcode-command-btn" @click="doSend" :loading="loadings.includes('sendGcode')" :disabled="loadings.includes('sendGcode') || !gcode" >
                    <v-icon class="mr-2">mdi-send</v-icon> {{ $t('Console.send')}}
                </v-btn>
            </v-col>

            <v-col class="col-auto align-content-center">
                <v-menu :offset-y="true" :close-on-content-click="true" max-height="98%" min-width="50%" max-width="98%" fixed top right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn class="mr-2 gcode-command-btn px-2 minwidth-0" v-bind="attrs" v-on="on">
                            <v-icon>mdi-help</v-icon>
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
                                    <span class="blue--text font-weight-bold mr-2 cursor-pointer" @click="gcode = cmd.command">{{ cmd.command }}:</span>
                                    <span>{{ cmd.description }}</span>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-card>
                </v-menu>
                <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Console.SetupConsole')">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn class="gcode-command-btn px-2 minwidth-0" color="lightgray" v-bind="attrs" v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
                    </template>
                    <v-list>
                        <v-list-item class="minHeight36">
                            <v-checkbox class="mt-0" v-model="hideWaitTemperatures" hide-details :label="$t('Console.HideTemperatures')"></v-checkbox>
                        </v-list-item>
                        <v-list-item class="minHeight36" v-for="(filter, index) in customFilters" v-bind:key="index">
                            <v-checkbox class="mt-0" v-model="filter.bool" @change="toggleFilter(filter)" hide-details :label="filter.name"></v-checkbox>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
        <v-row>
            <v-col ref="console" xs12 style="max-height: calc(100vh - 160px); overflow: auto;">
                <console-table :headers="headers"
                               :options="options"
                               :sort-by="sortBy"
                               :events="events"
                               :helplist="helplist"
                               :custom-sort="customSort"
                               :format-time-mobile="formatTimeMobile"
                               @command-click="commandClick"
                ></console-table>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import {colorConsoleMessage, reverseString, strLongestAnd} from "@/plugins/helpers"
    import ConsoleTable from "@/components/ConsoleTable";

    export default {
        name: "console",
        components: {ConsoleTable},
        data () {
            return {
                gcode: "",
                sortBy: 'date',
                options: {

                },
                lastCommands: [

                ],
                lastCommandNumber: null,
                items: [],
                cmdListSearch: null
            }
        },
        computed: {
            ...mapState({
                helplist: state => state.printer.helplist,
                loadings: state => state.socket.loadings,
            }),
            ...mapGetters([

            ]),
            helplistFiltered() {
              return this.helplist.filter(cmd => typeof(cmd.description) === "string" && (!this.cmdListSearch || cmd.commandLow.includes(this.cmdListSearch.toLowerCase())));
            },
            rows() {
                return this.gcode?.split('\n').length ?? 1;
            },
            headers() {
                return [
                    {
                        text: this.$t('Console.Date'),
                        value: 'date',
                        width: '15%',
                        dateType: 'Date',
                    },
                    {
                        text: this.$t('Console.Event'),
                        sortable: false,
                        value: 'message',
                        width: '85%'
                    },
                ]
            },
            events() {
                return this.$store.getters["server/getFilterdEvents"]
            },
            hideWaitTemperatures: {
                get() {
                    return this.$store.state.gui.console.hideWaitTemperatures
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { console: { hideWaitTemperatures: newVal } })
                }
            },
            customFilters() {
                return this.$store.state.gui.console.customFilters
            },
        },
        methods: {
            commandClick(msg) {
                this.gcode = msg.original.indexOf(":") > -1 ? msg.command.command : msg.original;
            },
            doSend(cmd) {
                if (!cmd.shiftKey) {
                    this.$store.dispatch('printer/sendGcode', this.gcode)

                    this.lastCommands.push(this.gcode);
                    this.gcode = "";
                    this.lastCommandNumber = null;
                    setTimeout(() => {
                        this.$refs.console.scroll({
                            top: 0,
                            left: 0,
                            behavior: 'smooth'
                        })
                    }, 20);
                } else {
                    this.gcode += '\n';
                }
            },
            formatTimeMobile(date) {
                let hours = date.getHours();
                if (hours < 10) hours = "0"+hours.toString();
                let minutes = date.getMinutes();
                if (minutes < 10) minutes = "0"+minutes.toString();
                let seconds = date.getSeconds();
                if (seconds < 10) seconds = "0"+seconds.toString();

                return hours+":"+minutes+":"+seconds;
            },
            colorConsoleMessage: colorConsoleMessage,
            onKeyUp() {
                if (this.lastCommandNumber === null && this.lastCommands.length) {
                    this.lastCommandNumber = this.lastCommands.length - 1;
                    this.gcode = this.lastCommands[this.lastCommandNumber];
                } else if (this.lastCommandNumber > 0) {
                    this.lastCommandNumber--;
                    this.gcode = this.lastCommands[this.lastCommandNumber];
                }
            },
            onKeyDown() {
                if (this.lastCommandNumber !== null && this.lastCommandNumber < (this.lastCommands.length - 1)) {
                    this.lastCommandNumber++;
                    this.gcode = this.lastCommands[this.lastCommandNumber];
                } else if (this.lastCommandNumber !== null && this.lastCommandNumber === (this.lastCommands.length - 1)) {
                    this.lastCommandNumber = null;
                    this.gcode = "";
                }
            },
            getAutocomplete(e) {
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
                                return strLongestAnd(acc, val.command);
                            }, commands[0].command));
                        } else {
                            this.gcode = commands.reduce((acc, val) => {
                                return strLongestAnd(acc, val.command);
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
            },
            customSort: function(items, index, isDesc) {
                items.sort((a, b) => {
                    if (index[0] === 'date') {
                        if (!isDesc[0]) return new Date(b[index]) -  new Date(a[index]);
                        else return new Date(a[index]) - new Date(b[index]);
                    } else {
                        if(typeof a[index] !== 'undefined'){
                            if (!isDesc[0]) return a[index].toLowerCase().localeCompare(b[index].toLowerCase());
                            else return b[index].toLowerCase().localeCompare(a[index].toLowerCase());
                        }
                    }
                });

                return items;
            },
            toggleFilter(filter) {
                this.$store.dispatch('gui/updateConsoleFilter',  filter)
            },
        },
    }
</script>
