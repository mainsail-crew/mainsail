<template>
    <v-dialog v-model="boolShowDialog" persistent max-width="800">
        <panel
            :title="$t('Machine.UpdatePanel.Commits').toString()"
            :icon="mdiUpdate"
            :margin-bottom="false"
            card-class="machine-update-commits-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="py-0 px-0">
                <v-row>
                    <v-col>
                        <v-timeline class="groupedCommits" align-top dense>
                            <update-panel-git-commits-list-day
                                v-for="group of groupedCommits"
                                :key="group.date.getTime()"
                                :repo="repo"
                                :grouped-commits="group" />
                        </v-timeline>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'
import { mdiUpdate, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import UpdatePanelGitCommitsListDay from '@/components/panels/Machine/UpdatePanelGitCommitsListDay.vue'

@Component({
    components: { UpdatePanelGitCommitsListDay, Panel },
})
export default class UpdatePanelGitCommitsList extends Mixins(BaseMixin) {
    mdiUpdate = mdiUpdate
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true }) readonly boolShowDialog!: boolean
    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo

    get commitsBehind() {
        return this.repo.commits_behind ?? []
    }

    get groupedCommits() {
        let output: ServerUpdateManagerStateGitRepoGroupedCommits[] = []
        let lastDate: null | Date = null
        let tmpCommits: ServerUpdateManagerStateGitRepoCommit[] = []

        this.commitsBehind.forEach((commit: any) => {
            const commitDate = new Date(commit.date * 1000)
            if (
                lastDate === null ||
                commitDate.getFullYear() !== lastDate.getFullYear() ||
                commitDate.getMonth() !== lastDate.getMonth() ||
                commitDate.getDay() !== lastDate.getDay()
            ) {
                if (tmpCommits.length && lastDate !== null) {
                    output.push({
                        date: lastDate,
                        commits: [...tmpCommits],
                    })
                }
                lastDate = commitDate
                tmpCommits = []
            }
            tmpCommits.push(commit)
        })

        return output
    }

    closeDialog() {
        this.$emit('close-dialog')
    }
}
</script>
