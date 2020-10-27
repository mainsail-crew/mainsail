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
            }
        },
        computed: {
            ...mapState({
                events: state => state.events,
            })
        },
        methods: {

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
