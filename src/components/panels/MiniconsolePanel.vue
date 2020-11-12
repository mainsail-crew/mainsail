<style>

    .minievent-table {
        max-height: 250px;
        overflow-y: auto;
    }

    .miniConsole .title-cell {
        white-space: nowrap;
    }

    .miniConsole .content-cell {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-console-line</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Console</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="mt-2"></v-divider>
      <form @submit="doSend">
        <v-row class="ml-3 mr-3">
          <v-col class="col ma-0 pa-0">
            <v-text-field
                v-model="gcode"
                placeholder="Send code..."
                class="pt-4"
                v-on:keydown.tab="getAutocomplete"
                ref="gcodeCommandField"
            ></v-text-field>
          </v-col>

          <v-col class="col-auto align-content-center">
            <v-btn color="info" class="gcode-command-btn" @click="doSend">
              <v-icon class="mr-2">mdi-send</v-icon> send
            </v-btn>
          </v-col>
        </v-row>
      </form>
      <v-divider class="mt-2"></v-divider>

      <v-card-text class="px-0 py-0 content">
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
                        <div class="text-center">empty</div>
                    </template>

                    <template #item="{ item }">
                        <tr>
                            <td class="log-cell title-cell py-2">
                                {{ formatTime(item.date)}}
                            </td>
                            <td class="log-cell content-cell pl-0 py-2" colspan="2" style="width:100%;">
                                <span v-if="item.message" class="message" v-html="formatMessage(item.message)"></span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import Vue from "vue";

    export default {
        components: {

        },
        data: function() {
            return {
                gcode : '',
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
            }
        },
        computed: {
            ...mapState({
                events: state => state.events,
              helplist: state => state.helplist,

            })
        },
        methods: {
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
            doSend(ev) {
              ev.preventDefault();
                this.$store.commit('setLoading', { name: 'loadingSendGcode' });
                this.$store.commit('addGcodeResponse', this.gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: this.gcode }, "sendGcode");
                this.gcode = "";
                this.lastCommandNumber = null;
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
            formatMessage(message) {
                message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

                return message;
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
        }
    }
</script>
