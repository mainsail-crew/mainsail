<style>

    .minievent-table {
        max-height: 250px;
        overflow-y: auto;
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
                        class="minievent-table"
                        :custom-sort="customSort"
                        sort-by="date"
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