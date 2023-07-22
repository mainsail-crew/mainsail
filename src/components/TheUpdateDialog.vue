<style scoped>
.updaterLogScroll {
    height: 350px;
    max-height: 350px;
    overflow-x: hidden;
}

.updaterLog .title-cell {
    white-space: nowrap;
    vertical-align: top;
}

.updaterLog.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    height: auto;
}
</style>

<template>
    <v-dialog :value="application !== ''" persistent max-width="800" class="mx-0">
        <v-card dark :loading="!complete">
            <template slot="progress">
                <v-progress-linear color="primary" indeterminate></v-progress-linear>
            </template>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon left>{{ mdiUpdate }}</v-icon>
                        <template v-if="application.substr(0, 8) === 'recover_' && !complete">
                            {{ $t('App.UpdateDialog.Recovering', { software: application.substr(8) }) }}
                        </template>
                        <template v-else-if="application.substr(0, 8) === 'recover_'">
                            {{ $t('App.UpdateDialog.RecoveringDone', { software: application.substr(8) }) }}
                        </template>
                        <template v-else-if="!complete">
                            {{ $t('App.UpdateDialog.Updating', { software: application }) }}
                        </template>
                        <template v-else>
                            {{ $t('App.UpdateDialog.UpdatingDone', { software: application }) }}
                        </template>
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="px-3">
                <v-row>
                    <v-col class="py-6 px-0">
                        <overlay-scrollbars ref="updaterLogScroll" class="updaterLogScroll">
                            <v-data-table
                                ref="updaterLog"
                                :headers="headers"
                                :items="messages"
                                item-key="date"
                                hide-default-footer
                                hide-default-header
                                disable-pagination
                                class="updaterLog"
                                :custom-sort="customSort"
                                sort-by="date"
                                :sort-desc="true"
                                color="primary">
                                <template #no-data>
                                    <div class="py-2">{{ $t('App.UpdateDialog.Empty') }}</div>
                                </template>

                                <template #item="{ item }">
                                    <tr>
                                        <td class="log-cell title-cell py-2">
                                            {{ formatTime(item.date) }}
                                        </td>
                                        <td class="log-cell content-cell pl-0 py-2" colspan="2" style="width: 100%">
                                            <span v-if="item.message" class="message" v-html="item.message"></span>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </overlay-scrollbars>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="text-center pt-5">
                        <v-btn text :disabled="!complete" color="primary" @click="close">
                            {{ $t('App.UpdateDialog.Close') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiUpdate } from '@mdi/js'

@Component({
    components: {},
})
export default class TheUpdateDialog extends Mixins(BaseMixin) {
    mdiUpdate = mdiUpdate

    declare $refs: {
        updaterLogScroll: any
        updaterLog: HTMLDivElement
    }

    headers = [
        {
            text: 'Date',
            value: 'date',
            width: '1%',
            dateType: 'Date',
        },
        {
            text: 'Message',
            sortable: false,
            value: 'message',
            width: '99%',
        },
    ]

    get application() {
        return this.$store.state.server.updateManager.updateResponse.application ?? ''
    }

    get messages() {
        return this.$store.state.server.updateManager.updateResponse.messages ?? []
    }

    get complete() {
        return this.$store.state.server.updateManager.updateResponse.complete ?? true
    }

    customSort(items: any[], index: string, isDesc: boolean[]) {
        items.sort((a, b) => {
            if (index[0] === 'date') {
                if (!isDesc[0]) return new Date(b[index]).getTime() - new Date(a[index]).getTime()
                else return new Date(a[index]).getTime() - new Date(b[index]).getTime()
            } else {
                if (typeof a[index] !== 'undefined') {
                    if (!isDesc[0]) return a[index].toLowerCase().localeCompare(b[index].toLowerCase())
                    else return b[index].toLowerCase().localeCompare(a[index].toLowerCase())
                }
            }
        })

        return items
    }

    formatTime(date: Date) {
        const hours = date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours()
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes()
        const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds().toString() : date.getSeconds()

        return hours + ':' + minutes + ':' + seconds
    }

    close() {
        if (
            this.application !== null &&
            this.complete &&
            ['client', 'mainsail', 'full'].includes(this.application.toLowerCase())
        )
            window.location.reload()
        else {
            this.$store.commit('server/updateManager/resetUpdateResponse')
            this.$socket.emit(
                'machine.update.status',
                { refresh: false },
                { action: 'server/updateManager/onUpdateStatus' }
            )
        }
    }

    @Watch('messages')
    messagesChanged() {
        setTimeout(() => {
            this.$nextTick(() => {
                if (this.$refs.updaterLogScroll) {
                    const overlayscroll = this.$refs.updaterLogScroll.osInstance()
                    overlayscroll?.scroll({ y: '100%' })
                }
            })
        }, 50)
    }
}
</script>
