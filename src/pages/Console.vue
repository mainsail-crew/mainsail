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
                <v-text-field
                    v-model="gcode"
                    :items="items"
                    :label="$t('Console.SendCode')"
                    solo
                    class="gcode-command-field"
                    ref="gcodeCommandField"
                    autocomplete="off"
                    v-on:keyup.enter="doSend"
                    v-on:keyup.up="onKeyUp"
                    v-on:keyup.down="onKeyDown"
                    v-on:keydown.tab="getAutocomplete"
                ></v-text-field>
            </v-col>

            <v-col class="col-auto align-content-center">
                <v-btn color="info" class="gcode-command-btn" @click="doSend" :loading="loadings.includes('sendGcode')" :disabled="loadings.includes('sendGcode')" >
                    <v-icon class="mr-2">mdi-send</v-icon> {{ $t('Console.send')}}
                </v-btn>
            </v-col>

            <v-col class="col-auto align-content-center">
                <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Console.SetupConsole')">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn class="gcode-command-btn px-2 minwidth-0" color="lightgray" v-bind="attrs" v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
                    </template>
                    <v-list>
                        <v-list-item class="minHeight36">
                            <v-checkbox class="mt-0" v-model="hideWaitTemperatures" hide-details :label="$t('Console.HideTemperatures')"></v-checkbox>
                        </v-list-item>
                        <v-list-item class="minHeight36">
                            <v-checkbox class="mt-0" v-model="boolCustomFilters" hide-details :label="$t('Console.CustomFilters')"></v-checkbox>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
        <v-row>
            <v-col xs12>
                <v-data-table
                    :headers="headers"
                    :options="options"
                    :sort-by.sync="sortBy"
                    :items="events"
                    item-key="date"
                    hide-default-footer
                    disable-pagination
                    class="event-table"
                    :custom-sort="customSort"
                    mobile-breakpoint="0"
                >
                    <template #no-data>
                        <div class="text-center">{{ $t("Console.Empty")}}</div>
                    </template>

                    <template #item="{ item }">
                        <tr>
                            <td class="log-cell title-cell py-2 flex-grow-0 pr-0 d-none d-sm-table-cell">
                                {{ item.date.toLocaleString() }}
                            </td>
                            <td class="log-cell title-cell py-2 flex-grow-0 pr-0 d-sm-none">
                                {{ formatTimeMobile(item.date)}}
                            </td>
                            <td class="log-cell content-cell py-2" colspan="2">
                                <span v-if="item.message" :class="'message '+colorConsoleMessage(item)" v-html="formatConsoleMessage(item.message)"></span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import { colorConsoleMessage, formatConsoleMessage } from "@/plugins/helpers"

    export default {
        name: "console",
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
            }
        },
        computed: {
            ...mapState({
                helplist: state => state.printer.helplist,
                loadings: state => state.socket.loadings,
            }),
            ...mapGetters([

            ]),
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
            boolCustomFilters: {
                get() {
                    return this.$store.state.gui.console.boolCustomFilters
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { console: { boolCustomFilters: newVal } })
                }
            }
        },
        methods: {
            doSend() {
                this.$store.dispatch('printer/sendGcode', this.gcode)

                this.lastCommands.push(this.gcode);
                this.gcode = "";
                this.lastCommandNumber = null;
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
            formatConsoleMessage: formatConsoleMessage,
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
                    let commands = this.helplist.filter((element) => element.commandLow.indexOf(this.gcode.toLowerCase()) === 0);
                    if (commands && commands.length === 1) this.gcode = commands[0].command;
                    else {
                        let commands = this.helplist.filter((element) => element.commandLow.includes(this.gcode.toLowerCase()));
                        if (commands && commands.length) {
                            let output = "";
                            commands.forEach(command => output += "<b>"+command.command+":</b> "+command.description+"<br />");

                            this.$store.commit('server/addEvent', { message: output, type: 'command' });
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
            }
        },
    }
</script>