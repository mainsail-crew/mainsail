<template>
    <v-alert text dense border="left" color="orange" :icon="mdiAlertCircle">
        <template v-if="boolTitle">
            <strong>{{ $t('Machine.UpdatePanel.UpdateWarning', { name: formatName }) }}</strong>
            <br />
        </template>
        <p v-if="description1">{{ description1 }}</p>
        <p v-if="description2">{{ description2 }}</p>
        <div class="text-center">
            <v-btn
                v-if="configured_type === 'git_repo' && repo.commits_behind?.length"
                class="mx-2 mt-3 mt-sm-0"
                @click="openCommitHistory">
                <v-icon left small>{{ mdiEye }}</v-icon>
                {{ $t('Machine.UpdatePanel.CommitHistory') }}
            </v-btn>
            <v-btn v-if="externalLink" class="mx-2 mt-3 mt-sm-0" :href="externalLink" target="_blank">
                <v-icon left small>{{ mdiOpenInNew }}</v-icon>
                {{ externalLinkText }}
            </v-btn>
        </div>
    </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ServerUpdateManagerStateGitRepo } from '@/store/server/updateManager/types'
import { mdiAlertCircle, mdiEye, mdiOpenInNew } from '@mdi/js'
import { capitalize } from '@/plugins/helpers'

const props = defineProps<{
    repo: ServerUpdateManagerStateGitRepo
    boolTitle?: boolean
}>()

const emit = defineEmits<{
    'open-commit-history': []
}>()

const { t } = useI18n()

const mdiAlertCircle = mdiAlertCircle
const mdiEye = mdiEye
const mdiOpenInNew = mdiOpenInNew

const name = computed(() => props.repo?.name ?? 'UNKNOWN')

const formatName = computed(() => capitalize(name.value))

const configured_type = computed(() => props.repo?.configured_type ?? 'UNKNOWN')

const description1 = computed(() => {
    if (name.value === 'klipper') return t('Machine.UpdatePanel.KlipperUpdateQuestionFirmware')
    if (name.value === 'moonraker') return t('Machine.UpdatePanel.MoonrakerUpdateQuestion')
    if (configured_type.value === 'web') return t('Machine.UpdatePanel.WebClientUpdateQuestion')
    return t('Machine.UpdatePanel.GenericUpdateQuestion')
})

const description2 = computed(() => {
    if (name.value === 'klipper') return t('Machine.UpdatePanel.KlipperUpdateQuestionConfig')
    return null
})

const repo_name = computed(() => props.repo.repo_name ?? props.repo.name ?? '')

const externalLink = computed(() => {
    if (name.value === 'klipper') return '//www.klipper3d.org/Config_Changes.html'
    if (name.value === 'moonraker') return '//moonraker.readthedocs.io/en/latest/changelog/'
    if (props.repo?.configured_type === 'web')
        return `//github.com/${props.repo.owner}/${repo_name.value}/releases/tag/${props.repo.remote_version}`
    return `//github.com/${props.repo.owner}/${repo_name.value}`
})

const externalLinkText = computed(() => {
    if (['klipper', 'moonraker'].includes(name.value)) return t('Machine.UpdatePanel.ConfigChanges')
    return t('Machine.UpdatePanel.GitHubPage')
})

function openCommitHistory() {
    emit('open-commit-history')
}
</script>
