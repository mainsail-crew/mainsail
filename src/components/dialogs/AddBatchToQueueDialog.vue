<template>
    <v-dialog v-model="showDialog" :max-width="400" @click:outside="closeDialog" @keydown.esc="closeDialog">
        <panel
            :title="$t('Files.AddToQueue')"
            card-class="gcode-files-add-to-queue-dialog"
            :icon="mdiPlaylistPlus"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-form v-model="isValid" @submit.prevent="addBatchToQueueAction">
                <v-card-text>
                    <v-text-field
                        ref="inputField"
                        v-model="input"
                        :label="$t('Files.Count')"
                        required
                        hide-spin-buttons
                        type="number"
                        :rules="rules.count">
                        <template #append-outer>
                            <div class="_spin_button_group">
                                <v-btn class="mt-n3" icon plain small @click="input++">
                                    <v-icon>{{ mdiChevronUp }}</v-icon>
                                </v-btn>
                                <v-btn :disabled="input <= 1" class="mb-n3" icon plain small @click="input--">
                                    <v-icon>{{ mdiChevronDown }}</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeDialog">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text type="submit" :disabled="!isValid">
                        {{ $t('Files.AddToQueue') }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown, mdiChevronUp, mdiPlaylistPlus, mdiCloseThick } from '@mdi/js'

@Component
export default class AddBatchToQueueDialog extends Mixins(BaseMixin) {
    mdiChevronDown = mdiChevronDown
    mdiChevronUp = mdiChevronUp
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Boolean, default: false }) readonly showToast!: boolean
    @Prop({ type: String, required: true }) readonly filename!: string
    @Ref() inputField!: HTMLInputElement

    isValid = false
    // because of the text field, the input is always a string
    input: string = '1'

    rules = {
        count: [
            (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
            (value: string) => parseInt(value, 10) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
        ],
    }

    async addBatchToQueueAction() {
        const array = Array(parseInt(this.input)).fill(this.filename)

        await this.$store.dispatch('server/jobQueue/addToQueue', array)

        if (this.showToast)
            this.$toast.info(this.$t('History.AddToQueueSuccessful', { filename: this.filename }).toString())

        this.closeDialog()
    }

    closeDialog() {
        this.showDialog = false
    }

    resetFormState() {
        this.input = '1'
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        this.resetFormState()
        setTimeout(() => {
            this.inputField?.focus()
        })
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
