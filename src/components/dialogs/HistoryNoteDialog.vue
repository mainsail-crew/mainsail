<template>
    <v-dialog :value="show" :max-width="600" persistent @keydown.esc="close">
        <panel :title="headline" :icon="icon" card-class="history-note-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea v-model="text" outlined hide-details :label="$t('History.Note')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="" text @click="close">{{ $t('History.Cancel') }}</v-btn>
                <v-btn color="primary" text @click="save">{{ $t('History.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiCloseThick, mdiNotebookEdit, mdiNotebookPlus } from '@mdi/js'

@Component
export default class HistoryNoteDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJob

    text = ''

    get headline() {
        return this.job.note ? this.$t('History.EditNote') : this.$t('History.CreateNote')
    }

    get icon() {
        return this.job.note ? mdiNotebookEdit : mdiNotebookPlus
    }

    save() {
        this.$store.dispatch('server/history/saveHistoryNote', {
            job_id: this.job.job_id,
            note: this.text,
        })

        this.close()
    }

    close() {
        this.$emit('close')
    }

    @Watch('show')
    onShowChanged() {
        if (this.show) {
            this.text = this.job.note ?? ''
        }
    }
}
</script>
