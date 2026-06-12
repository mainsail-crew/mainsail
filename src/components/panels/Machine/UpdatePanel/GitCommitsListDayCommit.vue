<template>
    <li class="commit px-3 py-2">
        <v-row class="flex-column flex-sm-row">
            <v-col>
                <h4 class="subtitle-2 text--white mb-0">
                    {{ title }}
                    <v-chip variant="outlined" label size="x-small" class="ml-2 px-2" @click="showDetails = !showDetails">
                        <v-icon size="small">{{ mdiDotsHorizontal }}</v-icon>
                    </v-chip>
                </h4>
                <p
                    v-if="showDetails"
                    class="text-caption text-secondary mb-2"
                    style="white-space: pre-line"
                    v-html="message"></p>
                <p class="caption mb-0">
                    <span class="font-weight-bold text-decoration-none white--text">
                        {{ author }}
                    </span>
                    <span>{{ commitFormatDate }}</span>
                </p>
            </v-col>
            <v-col class="col-auto pt-0 pt-sm-4">
                <v-chip variant="outlined" label size="small" :href="commitHref" target="_blank">
                    {{ commitShortSha }}
                </v-chip>
            </v-col>
        </v-row>
    </li>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBase } from '@/composables/useBase'
import { useI18n } from 'vue-i18n'
import { mdiDotsHorizontal } from '@mdi/js'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
} from '@/store/server/updateManager/types'

const props = defineProps<{
    commit: ServerUpdateManagerStateGitRepoCommit
    repo: ServerUpdateManagerStateGitRepo
}>()

const { browserLocale } = useBase()
const { t } = useI18n()

const showDetails = ref(false)

const title = computed(() => props.commit.subject)

const message = computed(() => props.commit.message)

const author = computed(() => props.commit.author)

const commitFormatDate = computed(() => {
    const commitDay = new Date(props.commit.date * 1000)
    commitDay.setHours(0, 0, 0, 0)
    const todayDay = new Date()
    todayDay.setHours(0, 0, 0, 0)
    const diff = Math.floor((todayDay.getTime() - commitDay.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 0) {
        const diffHours = Math.floor((new Date().getTime() - props.commit.date * 1000) / (1000 * 60 * 60))
        return t('Machine.UpdatePanel.CommittedHoursAgo', { hours: diffHours })
    } else if (diff === 1) return t('Machine.UpdatePanel.CommittedYesterday')
    else if (diff < 29) return t('Machine.UpdatePanel.CommittedDaysAgo', { days: diff })
    else
        return t('Machine.UpdatePanel.CommittedOnDate', {
            date: commitDay.toLocaleDateString(browserLocale.value, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
        })
})

const repo_name = computed(() => props.repo.repo_name ?? props.repo.name ?? '')

const commitHref = computed(() =>
    `https://github.com/${props.repo.owner}/${repo_name.value}/commit/${props.commit.sha}`
)

const commitShortSha = computed(() => props.commit.sha.substring(0, 6))
</script>

<style scoped>
li.commit {
    border-color: rgb(48, 54, 61);
    border-style: solid;
    border-width: 1px;
    border-bottom-width: 0;

    &:first-child {
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
    }

    &:last-child {
        border-bottom-width: 1px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
    }
}
</style>
