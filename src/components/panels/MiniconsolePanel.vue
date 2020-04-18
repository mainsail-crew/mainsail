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
                        :sort-by.sync="sortBy"
                        :sort-desc.sync="sortDesc"
                        :items="events"
                        item-key="date"
                        hide-default-footer
                        disable-pagination
                        class="minievent-table"
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
                sortBy: 'date',
                sortDesc: true,
                headers: [
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
        }
    }
</script>