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

    .log-cell {
        padding: 16px !important;
    }

    .log-cell.title-cell {
        vertical-align: top;
    }
</style>

<template>
    <div>
        <v-row>
            <v-col class="col">
                <v-text-field
                        v-model="gcode"
                        :items="items"
                        label="Send code..."
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
                <v-btn color="info" class="gcode-command-btn" @click="doSend" :loading="loadingSendGcode" :disabled="loadingSendGcode" >
                    <v-icon class="mr-2">mdi-send</v-icon> send
                </v-btn>
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
                >
                    <template #no-data>
                        <div class="text-center">empty</div>
                    </template>

                    <template #item="{ item }">
                        <tr>
                            <td class="log-cell title-cell">
                                {{ item.date.toLocaleString() }}
                            </td>
                            <td class="log-cell content-cell" colspan="2">
                                <span v-if="item.message" class="message" v-html="formatMessage(item.message)"></span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import Vue from "vue";

    export default {
        data () {
            return {
                gcode: "",
                sortBy: 'date',
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
                lastCommands: [

                ],
                lastCommandNumber: null,
                items: [],
                loadingSendGcode: false,
            }
        },
        computed: {
            ...mapState({
                events: state => state.events,
                helplist: state => state.helplist,
                loadings: state => state.loadings,
            }),
            ...mapGetters([
                'getMacros'
            ]),
        },
        methods: {
            doSend() {
                this.$store.commit('setLoading', { name: 'loadingSendGcode' });
                this.$store.commit('addGcodeResponse', this.gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: this.gcode }, "sendGcode");
                this.lastCommands.push(this.gcode);
                this.gcode = "";
                this.lastCommandNumber = null;
            },
            formatMessage(message) {
                if (typeof message === "string") message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

                return message;
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

                            this.$store.commit('addGcodeResponse', output);
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
        watch: {
            loadings: {
                handler: function(newVal) {
                    this.loadingSendGcode = newVal.includes('loadingSendGcode');
                }
            }
        }
    }
</script>