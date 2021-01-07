<style>

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
    <v-card>
        <v-toolbar flat dense>
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-console-line</v-icon>Console</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu :offset-y="true" :close-on-content-click="false" title="Setup Console">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn small class="px-2 minwidth-0" color="lightgray" v-bind="attrs" v-on="on"><v-icon small>mdi-cog</v-icon></v-btn>
                </template>
                <v-list>
                    <v-list-item class="minHeight36">
                        <v-checkbox class="mt-0" v-model="hideWaitTemperatures" hide-details label="Hide temperatures"></v-checkbox>
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox class="mt-0" v-model="boolCustomFilters" hide-details label="Custom filters"></v-checkbox>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-toolbar>
        <v-card-text>
            <v-container class="py-0 px-0">
                <v-row>
                    <v-col>
                        <v-text-field
                            label="Send code..."
                            ref="gcodeCommandField"
                            solo
                            hide-details
                            autocomplete="off"
                            v-model="gcode"
                            v-on:keyup.enter="doSend"
                            v-on:keyup.up="onKeyUp"
                            v-on:keyup.down="onKeyDown"
                            :items="items"
                            v-on:keydown.tab="getAutocomplete"
                        ></v-text-field>
                    </v-col>
                    <v-col class="col-auto align-content-center">
                        <v-btn color="info" class="gcode-command-btn" @click="doSend" :loading="loadings.includes('sendGcode')" :disabled="loadings.includes('sendGcode')" >
                            <v-icon class="mr-2">mdi-send</v-icon> send
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-text class="px-0 py-0 content">
            <v-divider></v-divider>
            <v-data-table
                :headers="headers"
                :options="options"
                :items="events"
                item-key="date"
                hide-default-footer
                hide-default-header
                disable-pagination
                class="minievent-table miniConsole"
                :custom-sort="customSort"
                sort-by="date"
            >
                <template #no-data>
                    <div class="py-2">empty</div>
                </template>

                <template #item="{ item }">
                    <tr>
                        <td class="log-cell title-cell py-2">
                            {{ formatTime(item.date)}}
                        </td>
                        <td class="log-cell content-cell pl-0 py-2" colspan="2" style="width:100%;">
                            <span v-if="item.message" :class="'message '+colorConsoleMessage(item)" v-html="formatConsoleMessage(item.message)"></span>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import {mapState} from 'vuex'
    import Vue from "vue";
    import { colorConsoleMessage, formatConsoleMessage } from "@/plugins/helpers";

    export default {
        components: {

        },
        data: function() {
            return {
                headers: [
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
                ],
                options: {

                },
                gcode: "",
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
            events: {
                get() {
                    return this.$store.getters["server/getFilterdEvents"]
                }
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
                this.$store.commit('socket/addLoading', { name: 'sendGcode' });
                this.$store.commit('server/addEvent', this.gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: this.gcode }, "socket/removeLoading", { name: 'sendGcode' });
                this.lastCommands.push(this.gcode);
                this.gcode = "";
                this.lastCommandNumber = null;
            },
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

                            this.$store.commit('server/addEvent', output);
                        }
                    }
                }
                this.$refs.gcodeCommandField.focus();
            },
            formatTime(date) {
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
        }
    }
</script>
