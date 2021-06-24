<template>
    <v-data-table
        :headers="headers"
        :options="options"
        :sort-by.sync="sortByData"
        :sort-desc.sync="sortDescData"
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
                    <span v-if="item.message" :class="'message '+colorConsoleMessage(item)" v-html="formatConsoleMessage(item.message)"></span>
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
import {CommandHelp, ConsoleCommandHelp} from "@/store/printer/types";

@Component
export default class ConsoleTable extends Vue {
    @Prop({ required: true })
    readonly headers!: any[];

    @Prop({ required: false, default: 'date' })
    readonly sortBy!: string;

    @Prop({ required: false, default: true })
    readonly sortDesc!: boolean;

    @Prop({ required: true })
    readonly events!: any[];

    @Prop({ required: false, default: () => null })
    readonly formatTimeMobile!: (d: Date) => any;

    @Prop({ required: true })
    readonly options!: any;

    @Prop({ required: false, default: false })
    readonly isMini!: boolean;

    @Prop({ required: true })
    readonly helplist!: CommandHelp[];

    colorConsoleMessage = colorConsoleMessage
    formatConsoleMessage = formatConsoleMessage

    private _sortBy?: string;

    get sortByData(): string {
        return this._sortBy ?? this.sortBy;
    }

    set sortByData(val: string) {
        this._sortBy = val;
    }

    private _sortDesc?: boolean;

    get sortDescData(): boolean {
        return this._sortDesc ?? this.sortDesc;
    }

    set sortDescData(val: boolean) {
        this._sortDesc = val;
    }

    isCommand(message: string): ConsoleCommandHelp | null {
        if (!this.helplist) {
            return null;
        }

        const ret: ConsoleCommandHelp = {
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
            ret.command = this.helplist.find(c => c.commandLow === msg.split(/[:\s]/)[0].trim().toLowerCase()) ?? null;
        } else {
            ret.command = this.helplist.find(c => c.commandLow === msg.trim().toLowerCase()) ?? null;
        }

        return ret;
    }

    customSort(items: any, index: string, isDesc: boolean[]): any {
        items.sort((a: any, b: any) => {
            if (index[0] === 'date') {
                const aTime = new Date(b[index]).getTime()
                const bTime = new Date(b[index]).getTime()

                return aTime - bTime;
            } else {
                if(typeof a[index] !== 'undefined'){
                    return b[index].toLowerCase().localeCompare(a[index].toLowerCase());
                }
            }
        });

        if (isDesc[0]) items.reverse()

        return items;
    }
}
</script>

<style scoped>

</style>
