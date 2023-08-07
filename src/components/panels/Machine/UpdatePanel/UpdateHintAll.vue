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
                        <update-hint-alert
                            v-for="repo of filteredModules"
                            :key="repo.name"
                            :repo="repo.data"
                            :bool-title="true"
                            @open-commit-history="openCommitHistory(repo.data)" />
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
                <v-btn text color="primary" :disabled="!checkboxUpdateQuestion" @click="updateAll">
                    {{ $t('Machine.UpdatePanel.StartUpdate') }}
                </v-btn>
            </v-card-actions>
        </panel>
        <git-commits-list
            :bool-show-dialog="boolShowCommitHistory"
            :repo="showCommitsRepo"
            @close-dialog="boolShowCommitHistory = false" />
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerUpdateManagerStateGitRepo, ServerUpdateManagerStateGuiList } from '@/store/server/updateManager/types'
import { mdiProgressQuestion, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDay from '@/components/panels/Machine/UpdatePanel/GitCommitsListDay.vue'
import UpdateHintAlert from '@/components/panels/Machine/UpdatePanel/UpdateHintAlert.vue'
import semver from 'semver'

@Component({
    components: { GitCommitsListDay, Panel, UpdateHintAlert },
})
export default class UpdateHintAll extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiProgressQuestion = mdiProgressQuestion

    checkboxUpdateQuestion = false
    boolShowCommitHistory = false
    showCommitsRepo: ServerUpdateManagerStateGitRepo | null = null

    @Prop({ required: true }) readonly boolShowDialog!: boolean

    get modules() {
        return this.$store.getters['server/updateManager/getUpdateManagerList'] ?? []
    }

    get filteredModules() {
        return this.modules.filter((module: ServerUpdateManagerStateGuiList) => {
            // check git repos for updates
            if (module.type === 'git' && module.data?.commits_behind?.length) return true

            // check client web for updates
            if (
                module.type === 'web' &&
                semver.valid(module.data?.remote_version) &&
                semver.valid(module.data?.version) &&
                semver.gt(module.data?.remote_version, module.data?.version)
            )
                return true

            return false
        })
    }

    openCommitHistory(repo: ServerUpdateManagerStateGitRepo) {
        this.showCommitsRepo = repo
        this.boolShowCommitHistory = true
    }

    closeDialog() {
        this.$emit('close-dialog')
    }

    updateAll() {
        this.$emit('update-all')
    }
}
</script>
