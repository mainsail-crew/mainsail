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
                        <v-text-field
                            :label="$t('Panels.MiniconsolePanel.SendCode')"
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
                            <v-icon class="mr-2">mdi-send</v-icon> {{ $t("Panels.MiniconsolePanel.Send") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-text class="px-0 py-0 content">
            <v-divider></v-divider>
            <v-data-table
                :headers="headers"
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
                    <div class="py-2">{{ $t("Panels.MiniconsolePanel.Empty") }}</div>
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

<script lang="ts">
import { colorConsoleMessage, formatConsoleMessage } from "@/plugins/helpers"
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class MiniconsolePanel extends Mixins(BaseMixin) {
    colorConsoleMessage = colorConsoleMessage
    formatConsoleMessage = formatConsoleMessage

    $refs!: {
        gcodeCommandField: HTMLInputElement
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
    private items = []

    get helplist() {
        return this.$store.state.printer.helplist
    }

    get events() {
        return this.$store.getters['server/getFilteredEvents']
    }

    get hideWaitTemperatures() {
        return this.$store.state.gui.console.hideWaitTemperatures
    }

    set hideWaitTemperatures(newVal) {
        this.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: "console.hideWaitTemperatures", value: newVal }, 'gui/updateDataFromDB')
    }

    get customFilters() {
        return this.$store.state.gui.console.customFilters
    }

    doSend() {
        this.$store.dispatch('printer/sendGcode', this.gcode)
        this.lastCommands.push(this.gcode)
        this.gcode = ""
        this.lastCommandNumber = null
    }

    onKeyUp() {
        if (this.lastCommandNumber === null && this.lastCommands.length) {
            this.lastCommandNumber = this.lastCommands.length - 1;
            this.gcode = this.lastCommands[this.lastCommandNumber];
        } else if (this.lastCommandNumber && this.lastCommandNumber > 0) {
            this.lastCommandNumber--;
            this.gcode = this.lastCommands[this.lastCommandNumber];
        }
    }

    onKeyDown() {
        if (this.lastCommandNumber !== null && this.lastCommandNumber < (this.lastCommands.length - 1)) {
            this.lastCommandNumber++;
            this.gcode = this.lastCommands[this.lastCommandNumber];
        } else if (this.lastCommandNumber !== null && this.lastCommandNumber === (this.lastCommands.length - 1)) {
            this.lastCommandNumber = null;
            this.gcode = "";
        }
    }

    getAutocomplete(e: Event) {
        e.preventDefault();
        if (this.gcode.length) {
            let commands = this.helplist.filter((element: any) => element.commandLow.indexOf(this.gcode.toLowerCase()) === 0);
            if (commands && commands.length === 1) this.gcode = commands[0].command;
            else {
                let commands = this.helplist.filter((element: any) => element.commandLow.includes(this.gcode.toLowerCase()));
                if (commands && commands.length) {
                    let output = "";
                    commands.forEach((command: any) => output += "<b>"+command.command+":</b> "+command.description+"<br />");

                    this.$store.commit('server/addEvent', { message: output, type: 'command' });
                }
            }
        }
        this.$refs.gcodeCommandField?.focus();
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

    customSort(items: any, index: string, isDesc: boolean[]) {
        items.sort((a: any, b: any) => {
            if (index[0] === 'date') {
                const aTime = new Date(b[index]).getTime()
                const bTime = new Date(b[index]).getTime()

                if (!isDesc[0]) return aTime - bTime;
                else return aTime - bTime;
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
</script>
