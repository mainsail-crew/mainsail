<template>
    <v-dialog v-model="boolShowDialog" persistent max-width="600">
        <panel
            :title="$t('Machine.UpdatePanel.AreYouSure')"
            :icon="mdiProgressQuestion"
            :margin-bottom="false"
            card-class="machine-update-hint-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <update-hint-alert :repo="repo" @open-commit-history="openCommitHistory" />
                        <div>
                            <v-checkbox
                                v-model="checkboxUpdateQuestion"
                                :label="$t('Machine.UpdatePanel.IUnderstandTheRisks')"
                                hide-details />
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Machine.UpdatePanel.Abort') }}</v-btn>
                <v-btn text color="primary" :disabled="!checkboxUpdateQuestion" @click="doUpdate">
                    {{ $t('Machine.UpdatePanel.StartUpdate') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerUpdateManagerStateGitRepo } from '@/store/server/updateManager/types'
import { mdiProgressQuestion, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDay from '@/components/panels/Machine/UpdatePanel/GitCommitsListDay.vue'
import UpdateHintAlert from '@/components/panels/Machine/UpdatePanel/UpdateHintAlert.vue'

@Component({
    components: { GitCommitsListDay, Panel, UpdateHintAlert },
})
export default class UpdateHint extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiProgressQuestion = mdiProgressQuestion

    checkboxUpdateQuestion = false

    @Prop({ required: true }) readonly boolShowDialog!: boolean
    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo

    doUpdate() {
        this.$emit('do-update')
    }

    openCommitHistory() {
        this.$emit('open-commit-history')
    }

    closeDialog() {
        this.$emit('close-dialog')
    }
}
</script>
