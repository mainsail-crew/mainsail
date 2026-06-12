<template>
    <v-dialog :model-value="showDialog" @update:model-value="emitValue" persistent :max-width="800" :fullscreen="isMobile">
        <panel
            :title="$t('Machine.UpdatePanel.Commits')"
            :icon="mdiUpdate"
            :margin-bottom="false"
            card-class="machine-update-commits-dialog">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
            </template>
            <v-card-text class="py-0 px-0">
                <OverlayScrollbarsComponent :style="overlayScrollbarsStyle" :options="{ overflowBehavior: { x: 'hidden' } }">
                    <v-timeline :class="timelineClassName" align-top density="compact" style="min-height: 100%">
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
                                    <v-alert density="compact" variant="text" color="info">
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
                </OverlayScrollbarsComponent>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBase } from '@/composables/useBase'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'
import { mdiUpdate, mdiCloseThick } from '@mdi/js'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDay from '@/components/panels/Machine/UpdatePanel/GitCommitsListDay.vue'

const props = defineProps<{
    'model-value': boolean
    repo: ServerUpdateManagerStateGitRepo | null
}>()

const emit = defineEmits<{
    'update:model-value': [value: boolean]
}>()

const { isMobile } = useBase()

function emitValue(val: boolean) {
    emit('update:model-value', val)
}

const showDialog = computed(() => props['model-value'])

const commitsBehind = computed<ServerUpdateManagerStateGitRepoCommit[]>(() =>
    props.repo?.commits_behind ?? []
)

const groupedCommits = computed(() => {
    const output: ServerUpdateManagerStateGitRepoGroupedCommits[] = []
    let lastCommit: ServerUpdateManagerStateGitRepoCommit | null = null
    commitsBehind.value.forEach((commit: ServerUpdateManagerStateGitRepoCommit) => {
        const lastCommitDate = new Date((lastCommit?.date ?? 0) * 1000)
        const commitDate = new Date(commit.date * 1000)
        if (
            commitDate.getFullYear() !== lastCommitDate.getFullYear() ||
            commitDate.getMonth() !== lastCommitDate.getMonth() ||
            commitDate.getDate() !== lastCommitDate.getDate()
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
})

const displayFullHistoryWaring = computed(() => commitsBehind.value.length >= 30)

const lastCommit = computed(() => commitsBehind.value.slice(-1)[0])

const linkToGithub = computed(() =>
    `https://github.com/${props.repo?.owner}/${props.repo?.repo_name}/commits/${props.repo?.branch}/?after=${lastCommit.value?.sha}+0`
)

const overlayScrollbarsStyle = computed(() => {
    if (isMobile.value) {
        return { height: 'calc(100vh - 48px)' }
    }
    return { height: '400px' }
})

const timelineClassName = computed(() => {
    if (isMobile.value) return ['groupedCommits', 'mobile']
    return ['groupedCommits']
})

function closeDialog() {
    emit('update:model-value', false)
}
</script>

<style scoped>
.groupedCommits {
    padding-top: 0;
}

:deep(.git-commit-list-day) {
    padding-top: 24px;
    padding-bottom: 0;
}

:deep(.git-commit-list-day .v-timeline-item__dot--small) {
    width: 18px;
    height: 15px;
    margin-top: 2px;
}

:deep(.git-commit-list-day .v-timeline-item__dot--small:before) {
    display: block;
    content: ' ';
    position: relative;
    width: 18px;
    height: 2px;
    top: 7px;
    background: rgba(255, 255, 255, 0.5);
    z-index: 1;
}

:deep(.git-commit-list-day .v-timeline-item__inner-dot) {
    background-color: #1e1e1e !important;
    border: 2px solid rgba(255, 255, 255, 0.5) !important;
    width: 8px;
    height: 8px;
    position: relative;
    z-index: 2;
    margin-left: 5px;
    margin-top: 2px;
}

:deep(.git-commit-list-day.git-commit-list-warning .v-timeline-item__dot--small) {
    margin-top: 10px;
}

:deep(.groupedCommits).mobile {
    &:before {
        left: 20px;
    }

    .v-timeline-item__body {
        max-width: calc(100% - 41px);
    }

    .v-timeline-item__divider {
        min-width: 41px;
    }
}
</style>
