<template>
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
            <tr v-if="isMini">
                <td class="log-cell title-cell py-2">
                    {{ formatTime(item.date)}}
                </td>
                <td class="log-cell content-cell pl-0 py-2" colspan="2" style="width:100%;">
                    <span v-if="item.message" :class="'message '+colorConsoleMessage(item)" v-html="formatConsoleMessage(item.message, item.type)"></span>
                </td>
            </tr>
            <tr v-else>
                <td class="log-cell title-cell py-2 flex-grow-0 pr-0 d-none d-sm-table-cell">
                    {{ item.date.toLocaleString() }}
                </td>
                <td class="log-cell title-cell py-2 flex-grow-0 pr-0 d-sm-none">
                    {{ formatTimeMobile(item.date)}}
                </td>
                <td class="log-cell content-cell py-2" colspan="2">
                    <div v-if="item.message" :class="'message '+colorConsoleMessage(item)">
                        <div v-for="(msg, i) of formatConsoleMessage(item.message)" :key="i">
                            <span v-if="!!isCommand(msg).command || item.type === 'command'"
                                  v-html="msg"
                                  class="cursor-pointer"
                                  @click="$emit('command-click', isCommand(msg))"
                            />
                            <span v-else v-html="msg" />
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { colorConsoleMessage, formatConsoleMessage } from "@/plugins/helpers"
import Component from "vue-class-component";
import Vue from "vue";
import {Prop} from "vue-property-decorator";

@Component
export default class ConsoleTable extends Vue {
    @Prop() readonly headers: any[];
    @Prop() readonly sortBy: string;
    @Prop() readonly events: any[];
    @Prop() readonly customSort: () => any;
    @Prop() readonly formatTimeMobile: (d: Date) => any;
    @Prop() readonly options: Record<string, unknown>;
    @Prop() readonly isMini: boolean;
    @Prop() readonly helplist: any[];

    colorConsoleMessage = colorConsoleMessage
    formatConsoleMessage = formatConsoleMessage

    log(any: any): any {
        console.log(any);
        return any;
    }

    isCommand(message: string): Record<string, unknown> {
        if (!this.helplist) {
            return null;
        }

        const ret = {
            command: null,
            original: message
        };
        const msg = message.replace(/<.*?>/g, '');
        if (/^[mg][0-9]+.*$/gi.test(msg) || msg.toLowerCase().startsWith('help')) {
            ret.command = {
                command: msg.split(' ')[0],
                commandLow: msg.split(' ')[0].toLowerCase()
            }
        } else if ([':', ' '].some(c => msg.includes(c))) {
            ret.command = this.helplist.find(c => c.commandLow === msg.split(/[:\s]/)[0].trim().toLowerCase());
        } else {
            ret.command = this.helplist.find(c => c.commandLow === msg.trim().toLowerCase());
        }

        return ret;
    }
}
</script>

<style scoped>

</style>
