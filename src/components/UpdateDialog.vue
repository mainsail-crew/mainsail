<style scoped>
    .updaterLog {
        height: 350px;
        max-height: 350px;
        overflow-y: auto;
    }

    .updaterLog .title-cell {
        white-space: nowrap;
    }

    .updaterLog.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
        height: auto;
    }
</style>

<template>
    <v-dialog :value="application !== ''" persistent width="60%" max-width="800">
        <v-card
            dark
            :loading="!complete"
            color="primary"
        >
            <template slot="progress">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </template>
            <v-toolbar color="transparent" flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-update</v-icon>Updating {{ application }}...</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pt-2 pb-2">
                <v-data-table
                    :headers="headers"
                    :options="options"
                    :items="messages"
                    item-key="date"
                    hide-default-footer
                    hide-default-header
                    disable-pagination
                    class="updaterLog"
                    ref="updaterLog"
                    :custom-sort="customSort"
                    sort-by="date"
                    :sort-desc="true"
                    color="primary"
                >
                    <template #no-data>
                        <div class="py-2">empty</div>
                    </template>

                    <template #item="{ item }">
                        <tr>
                            <td class="log-cell title-cell py-2">
                                {{ formatTime(item.date)}}
                            </td>
                            <td class="log-cell content-cell pl-0 py-2" colspan="2" style="width:100%;">
                                <span v-if="item.message" class="message" v-html="item.message"></span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
                <v-row>
                    <v-col class="text-center pt-5">
                        <v-btn @click="close" :disabled="!complete" color="white" outlined>close</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import {mapState} from "vuex";

export default {
    name: "UpdateDialog.vue",
    data: function() {
        return {
            headers: [
                {
                    text: 'Date',
                    value: 'date',
                    width: '1%',
                    dateType: 'Date',
                }, {
                    text: 'Message',
                    sortable: false,
                    value: 'message',
                    width: '99%'
                },
            ],
            options: {

            },
        }
    },
    computed: {
        ...mapState({
            application: state => state.server.updateManager.updateResponse.application,
            complete: state => state.server.updateManager.updateResponse.complete,
            messages: state => state.server.updateManager.updateResponse.messages,
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
        },
        close() {
            if (this.application === "client" && this.complete) window.location.reload(true)
            else this.$store.commit('server/updateManager/resetUpdateResponse')
        }
    },
    updated(){
        if (this.$refs.updaterLog) this.$refs.updaterLog.$el.scrollTop = this.$refs.updaterLog.$el.scrollHeight
    }
}
</script>