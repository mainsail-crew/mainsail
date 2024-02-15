<template>
    <v-dialog :value="show" max-width="400">
        <panel
            :title="$t('JobQueue.ChangeCount')"
            :icon="mdiCounter"
            card-class="jobqueue-change-count-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-card-text>
                <v-text-field
                    ref="inputFieldAddToQueueCount"
                    v-model="count"
                    :label="$t('JobQueue.Count')"
                    required
                    :rules="countInputRules"
                    hide-spin-buttons
                    type="number"
                    @keyup.enter="update">
                    <template #append-outer>
                        <div class="_spin_button_group">
                            <v-btn class="mt-n3" icon plain small @click="count++">
                                <v-icon>{{ mdiChevronUp }}</v-icon>
                            </v-btn>
                            <v-btn :disabled="count <= 1" class="mb-n3" icon plain small @click="count--">
                                <v-icon>{{ mdiChevronDown }}</v-icon>
                            </v-btn>
                        </div>
                    </template>
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="" text @click="closeDialog">{{ $t('JobQueue.Cancel') }}</v-btn>
                <v-btn color="primary" text @click="update">{{ $t('JobQueue.ChangeCount') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiChevronUp, mdiChevronDown, mdiCounter } from '@mdi/js'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'

@Component({
    components: { Panel },
})
export default class JobqueueEntryChangeCountDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiChevronUp = mdiChevronUp
    mdiChevronDown = mdiChevronDown
    mdiCounter = mdiCounter

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: Object, required: true }) job!: ServerJobQueueStateJob

    count = 1

    countInputRules = [
        (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
        (value: string) => parseInt(value) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
    ]

    update() {
        this.$store.dispatch('server/jobQueue/changeCount', {
            job_id: this.job.job_id,
            count: this.count,
        })

        this.closeDialog()
    }

    closeDialog() {
        this.$emit('close')
    }

    @Watch('show')
    showChanged(show: boolean) {
        if (show) this.count = (this.job.combinedIds?.length ?? 0) + 1
    }
}
</script>
