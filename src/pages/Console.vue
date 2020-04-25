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
                    :sort-desc.sync="sortDesc"
                    :items="events"
                    item-key="date"
                    hide-default-footer
                    disable-pagination
                    class="event-table"
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
                sortDesc: true,
                headers: [
                    {
                        text: 'Date',
                        value: 'date',
                        width: '15%'
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
                items: []
            }
        },
        computed: {
            ...mapState({
                events: state => state.events,
                helplist: state => state.helplist,
            }),
            ...mapGetters([
                'getMacros'
            ]),
            loadingSendGcode: {
                get() {
                    return this.$store.state.socket.loadingSendGcode
                },
                set(value) {
                    return this.$store.dispatch('setLoadingSendGcode', value)
                }
            }
        },
        methods: {
            doSend() {
                window.console.log('send gcode: '+this.gcode);
                this.loadingSendGcode = true;
                Vue.prototype.$webSocketsSendObj('post_printer_gcode', { script: this.gcode }, "sendGcode");
                this.lastCommands.push(this.gcode);
                this.gcode = "";
                this.lastCommandNumber = null;
            },
            formatMessage(message) {
                message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

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
            }
        }
    }
</script>