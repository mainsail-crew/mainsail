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
                    label="Send code..."
                    solo
                    class="gcode-command-field"
                    v-on:keyup.enter="doSend"
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
    import { mapState } from 'vuex';

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

                }
            }
        },
        computed: {
            ...mapState({
                events: state => state.events,
            }),
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
                this.loadingSendGcode = true;
                this.$socket.sendObj('post_printer_gcode', { script: this.gcode }, "sendGcode");
            },
            formatMessage(message) {
                message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

                return message;
            }
        }
    }
</script>