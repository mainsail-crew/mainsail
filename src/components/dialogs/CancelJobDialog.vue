<template>
    <v-dialog :value="showDialog" width="400" persistent>
        <panel
            :title="$t('CancelJobDialog.CancelJob')"
            toolbar-color="normal"
            card-class="cancel-job-dialog"
            :icon="mdiStopCircleOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ $t('CancelJobDialog.AreYouSure') }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('CancelJobDialog.No') }}</v-btn>
                <v-btn color="primary" text @click="cancelJob">{{ $t('CancelJobDialog.Yes') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick, mdiStopCircleOutline } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class CancelJobDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiStopCircleOutline = mdiStopCircleOutline

    @Prop({ type: Boolean, default: false }) showDialog!: boolean

    cancelJob() {
        this.$emit('cancel-job')
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>

<style scoped></style>
