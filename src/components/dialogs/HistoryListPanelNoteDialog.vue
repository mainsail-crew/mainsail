<template>
    <v-dialog v-model="show" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel :title="panelTitle" :icon="icon" card-class="history-note-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" outlined hide-details :label="$t('History.Note')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="" text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                <v-btn color="primary" text @click="saveNote">{{ $t('History.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiCloseThick, mdiNoteEditOutline, mdiNotePlusOutline } from '@mdi/js'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class HistoryListPanelNoteDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    note: string = ''

    @Prop({ type: Boolean, required: true }) readonly show!: boolean
    @Prop({ type: String, required: true }) readonly type!: 'create' | 'edit'
    @Prop({ type: Object, required: true }) readonly job!: ServerHistoryStateJob

    get panelTitle() {
        if (this.type === 'create') return this.$t('History.CreateNote').toString()

        return this.$t('History.EditNote').toString()
    }

    get icon() {
        if (this.type === 'create') return mdiNotePlusOutline

        return mdiNoteEditOutline
    }

    saveNote() {
        this.$store.dispatch('server/history/saveHistoryNote', {
            job_id: this.job?.job_id,
            note: this.note,
        })

        this.closeDialog()
    }

    closeDialog() {
        this.$emit('close-dialog')
    }

    @Watch('show', { immediate: true })
    onShowChanged() {
        if (this.show) this.note = this.job.note ?? ''
    }
}
</script>

<style scoped>
::v-deep .os-content .row:first-child {
    margin-top: 1em !important;
}

::v-deep .os-content .row:last-child {
    margin-bottom: 1em !important;
}
</style>
