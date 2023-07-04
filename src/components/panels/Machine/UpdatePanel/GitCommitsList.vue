<template>
    <v-dialog v-model="boolShowDialog" persistent max-width="800">
        <panel
            :title="$t('Machine.UpdatePanel.Commits')"
            :icon="mdiUpdate"
            :margin-bottom="false"
            card-class="machine-update-commits-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="py-0 px-0">
                <overlay-scrollbars style="max-height: 400px" :options="{ overflowBehavior: { x: 'hidden' } }">
                    <v-row>
                        <v-col>
                            <v-timeline class="groupedCommits" align-top dense>
                                <git-commits-list-day
                                    v-for="group of groupedCommits"
                                    :key="group.date.getTime()"
                                    :repo="repo"
                                    :grouped-commits="group" />
                                <v-timeline-item
                                    v-if="displayFullHistoryWaring"
                                    small
                                    class="git-commit-list-day git-commit-list-warning">
                                    <v-row class="pt-0">
                                        <v-col class="pr-12">
                                            <v-alert dense text type="info">
                                                <p>{{ $t('Machine.UpdatePanel.MoreCommitsInfo') }}</p>
                                                <div class="text-center mb-3">
                                                    <v-btn :href="linkToGithub" target="_blank">
                                                        {{ $t('Machine.UpdatePanel.LinkToGithub') }}
                                                    </v-btn>
                                                </div>
                                            </v-alert>
                                        </v-col>
                                    </v-row>
                                </v-timeline-item>
                            </v-timeline>
                        </v-col>
                    </v-row>
                </overlay-scrollbars>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'
import { mdiUpdate, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDay from '@/components/panels/Machine/UpdatePanel/GitCommitsListDay.vue'

@Component({
    components: { GitCommitsListDay, Panel },
})
export default class GitCommitsList extends Mixins(BaseMixin) {
    mdiUpdate = mdiUpdate
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true }) readonly boolShowDialog!: boolean
    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo | null

    get commitsBehind(): ServerUpdateManagerStateGitRepoCommit[] {
        return this.repo?.commits_behind ?? []
    }

    get groupedCommits() {
        let output: ServerUpdateManagerStateGitRepoGroupedCommits[] = []
        let lastCommit: ServerUpdateManagerStateGitRepoCommit | null = null

        this.commitsBehind.forEach((commit: any) => {
            const lastCommitDate = new Date((lastCommit?.date ?? 0) * 1000)
            const commitDate = new Date(commit.date * 1000)

            if (
                commitDate.getFullYear() !== lastCommitDate.getFullYear() ||
                commitDate.getMonth() !== lastCommitDate.getMonth() ||
                commitDate.getDay() !== lastCommitDate.getDay()
            ) {
                output.push({
                    date: commitDate,
                    commits: [],
                })
            }

            output[output.length - 1].commits.push(commit)
            lastCommit = commit
        })

        return output
    }

    get displayFullHistoryWaring() {
        return this.commitsBehind.length >= 30
    }

    get lastCommit() {
        return this.commitsBehind.slice(-1)[0]
    }

    get linkToGithub() {
        return `https://github.com/${this.repo?.owner}/${this.repo?.name}/commits/${this.repo?.branch}/?after=${this.lastCommit?.sha}+0`
    }

    closeDialog() {
        this.$emit('close-dialog')
    }
}
</script>

<style lang="scss" scoped>
.groupedCommits {
    padding-top: 0;
}

::v-deep {
    .git-commit-list-day {
        padding-top: 24px;
        padding-bottom: 0;

        .v-timeline-item__dot--small {
            width: 18px;
            height: 15px;
            margin-top: 2px;

            &:before {
                display: block;
                content: ' ';
                position: relative;
                width: 18px;
                height: 2px;
                top: 7px;
                background: rgba(255, 255, 255, 0.5);
                z-index: 1;
            }
        }

        .v-timeline-item__inner-dot {
            background-color: #1e1e1e !important;
            border: 2px solid rgba(255, 255, 255, 0.5) !important;
            width: 8px;
            height: 8px;
            position: relative;
            z-index: 2;
            margin-left: 5px;
            margin-top: 2px;
        }

        &.git-commit-list-warning {
            .v-timeline-item__dot--small {
                margin-top: 10px;
            }
        }
    }
}
</style>
