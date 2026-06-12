<template>
    <div>
        <v-timeline-item size="small" class="git-commit-list-day">
            <v-row class="pt-0">
                <v-col class="pr-12">
                    <h3 class="caption">
                        {{ $t('Machine.UpdatePanel.CommitsOnDate', { date: groupedCommitsDate }) }}
                    </h3>
                    <ul class="commits mt-3 pl-0">
                        <git-commits-list-day-commit
                            v-for="commit of groupedCommits.commits"
                            :key="commit.sha"
                            :commit="commit"
                            :repo="repo" />
                    </ul>
                </v-col>
            </v-row>
        </v-timeline-item>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBase } from '@/composables/useBase'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'

const props = defineProps<{
    groupedCommits: ServerUpdateManagerStateGitRepoGroupedCommits
    repo: ServerUpdateManagerStateGitRepo
}>()

const { browserLocale } = useBase()

const groupedCommitsDate = computed(() =>
    new Date(props.groupedCommits.date).toLocaleDateString(browserLocale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
)
</script>

<style scoped>
ul.commits {
    list-style: none;
}
</style>
