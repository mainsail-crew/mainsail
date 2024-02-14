<template>
    <v-dialog v-model="isVisible" max-width="400" @click:outside="closeDialog" @keydown.esc="closeDialog">
        <panel
            :title="$t('Dialogs.AddBatchToQueue.AddToQueue')"
            card-class="gcode-files-add-to-queue-dialog"
            :icon="mdiPlaylistPlus"
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
                    :label="$t('Dialogs.AddBatchToQueue.Count')"
                    required
                    hide-spin-buttons
                    type="number"
                    :rules="countInputRules"
                    @keyup.enter="addBatchToQueueAction">
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
                <v-spacer></v-spacer>
                <v-btn color="" text @click="closeDialog">{{ $t('Dialogs.AddBatchToQueue.Cancel') }}</v-btn>
                <v-btn color="primary" text @click="addBatchToQueueAction">
                    {{ $t('Dialogs.AddBatchToQueue.AddToQueue') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown, mdiChevronUp, mdiPlaylistPlus, mdiCloseThick } from '@mdi/js'

export interface addBatchToQueueDialogProps {
    isVisible: boolean
    filename: string
}

const defaultCount = 1

@Component
export default class AddBatchToQueueDialog extends Mixins(BaseMixin) {
    mdiChevronDown = mdiChevronDown
    mdiChevronUp = mdiChevronUp
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiCloseThick = mdiCloseThick

    /**
     * Is dialog currently visible?
     */
    @Prop({ default: false }) declare readonly isVisible: addBatchToQueueDialogProps['isVisible']
    /**
     * Filename of the model to be added to the Queue.
     */
    @Prop({ required: true }) declare readonly filename: addBatchToQueueDialogProps['filename']

    private count: number = defaultCount

    private countInputRules = [
        (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
        (value: string) => parseInt(value, 10) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
    ]

    async addBatchToQueueAction() {
        const filename = this.filename

        const array: string[] = []
        for (let i = 0; i < this.count; i++) {
            array.push(filename)
        }

        await this.$store.dispatch('server/jobQueue/addToQueue', array)

        this.closeDialog()
    }

    closeDialog() {
        this.$emit('closeDialog')
    }

    @Watch('isVisible')
    isVisibleChanged(newIsVisible: boolean) {
        if (newIsVisible) {
            this.count = defaultCount
        }
    }
}
</script>

<style scoped>
._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}
</style>
