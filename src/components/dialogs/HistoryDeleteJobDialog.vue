<template>
    <v-dialog :value="show" max-width="400" @keydown.esc="close">
        <panel :title="$t('History.Delete')" card-class="history-delete-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <p class="mb-0">
                    {{ $t('History.DeleteSingleJobQuestion') }}
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="" text @click="close">{{ $t('History.Cancel') }}</v-btn>
                <v-btn color="error" text @click="deleteJob">{{ $t('History.Delete') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiCloseThick } from '@mdi/js'

@Component
export default class HistoryDeleteJobDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJob

    deleteJob() {
        this.$socket.emit(
            'server.history.delete_job',
            { uid: this.job.job_id },
            { action: 'server/history/getDeletedJobs' }
        )

        this.close()
    }

    close() {
        this.$emit('close')
    }
}
</script>
