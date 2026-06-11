<template>
    <div>
        <v-row class="py-2">
            <v-col class="pl-6">
                <strong>{{ name }}</strong>
                <br />
                <template v-if="type === 'git_repo' && commitsBehind.length">
                    <a class="info--text cursor--pointer" @click="boolShowCommitList = true">
                        <v-icon small color="info" class="mr-1">{{ mdiUpdate }}</v-icon>
                        {{ versionOutput }}
                    </a>
                </template>
                <template v-else-if="type === 'web' && semverUpdatable">
                    <a class="info--text text-decoration-none" :href="webLinkRelease" target="_blank">
                        <v-icon small color="info" class="mr-1">{{ mdiUpdate }}</v-icon>
                        {{ versionOutput }}
                    </a>
                </template>
                <template v-else-if="type === 'python' && semverUpdatable">
                    <a class="info--text text-decoration-none" :href="pythonChangelog" target="_blank">
                        <v-icon small color="info" class="mr-1">{{ mdiUpdate }}</v-icon>
                        {{ versionOutput }}
                    </a>
                </template>
                <span v-else>{{ versionOutput }}</span>
            </v-col>
            <v-col class="col-auto pr-6 text-right" align-self="center">
                <v-chip
                    v-if="anomalies.length > 0"
                    small
                    label
                    :outlined="!toggleAnomalies"
                    color="grey"
                    class="minwidth-0 px-1 mr-2"
                    @click="toggleAnomalies = !toggleAnomalies">
                    <v-icon small>{{ toggleAnomalies ? mdiInformationOutline : mdiInformation }}</v-icon>
                </v-chip>
                <template v-if="!isValid">
                    <v-menu :offset-y="true">
                        <template #activator="{ on, attrs }">
                            <v-chip
                                small
                                label
                                outlined
                                :color="btnColor"
                                :disabled="btnDisabled"
                                class="minwidth-0 px-2 text-uppercase"
                                v-bind="attrs"
                                v-on="on">
                                <v-icon small class="mr-1">{{ btnIcon }}</v-icon>
                                {{ btnText }}
                                <v-icon small>{{ mdiMenuDown }}</v-icon>
                            </v-chip>
                        </template>
                        <v-list dense class="py-0">
                            <v-list-item v-if="!isCorrupt" @click="doRecovery(false)">
                                <template #prepend>
                                    <v-icon small class="mr-0 pt-1">{{ mdiReload }}</v-icon>
                                </template>
                                <template #title>{{ $t('Machine.UpdatePanel.SoftRecovery') }}</template>
                            </v-list-item>
                            <v-list-item :disabled="!existsRecoveryUrl" @click="doRecovery(true)">
                                <template #prepend>
                                    <v-icon small class="mr-0 pt-1">{{ mdiReload }}</v-icon>
                                </template>
                                <template #title>{{ $t('Machine.UpdatePanel.HardRecovery') }}</template>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
                <v-chip
                    v-else
                    small
                    label
                    outlined
                    :color="btnColor"
                    :disabled="btnDisabled"
                    class="minwidth-0 px-2 text-uppercase"
                    @click="clickUpdate">
                    <v-icon small class="mr-1">{{ btnIcon }}</v-icon>
                    {{ btnText }}
                </v-chip>
            </v-col>
        </v-row>
        <v-row v-if="warnings.length" class="mt-0">
            <v-col class="px-6 pt-0">
                <v-alert
                    v-for="(message, index) in warnings"
                    :key="'warnings_' + index"
                    dense
                    text
                    color="orange"
                    border="left"
                    :icon="mdiCloseCircle">
                    <p class="text--disabled mb-0">{{ message }}</p>
                </v-alert>
            </v-col>
        </v-row>
        <v-row v-show="toggleAnomalies" class="mt-0">
            <v-col class="px-6 pt-0">
                <v-alert
                    v-for="(message, index) in anomalies"
                    :key="'anomalies_' + index"
                    dense
                    text
                    color="grey"
                    border="left"
                    :icon="mdiInformation">
                    {{ message }}
                </v-alert>
            </v-col>
        </v-row>
        <git-commits-list v-if="type === 'git_repo'" v-model="boolShowCommitList" :repo="repo" />
        <update-hint
            v-model="boolShowUpdateHint"
            :repo="repo"
            @open-commit-history="boolShowCommitList = true"
            @do-update="doUpdate" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import { useI18n } from 'vue-i18n'
import { ServerUpdateManagerStateGitRepo } from '@/store/server/updateManager/types'
import {
    mdiCloseCircle,
    mdiCheck,
    mdiHelpCircleOutline,
    mdiInformation,
    mdiInformationOutline,
    mdiMenuDown,
    mdiProgressUpload,
    mdiReload,
    mdiUpdate,
} from '@mdi/js'
import semver from 'semver'
import GitCommitsList from '@/components/panels/Machine/UpdatePanel/GitCommitsList.vue'
import UpdateHint from '@/components/panels/Machine/UpdatePanel/UpdateHint.vue'

const props = defineProps<{
    repo: ServerUpdateManagerStateGitRepo
}>()

const { printer_state } = useBase()
const store = useStore()
const socket = useSocket()
const { t } = useI18n()

const mdiInformation = mdiInformation
const mdiMenuDown = mdiMenuDown
const mdiReload = mdiReload
const mdiCloseCircle = mdiCloseCircle
const mdiUpdate = mdiUpdate
const mdiInformationOutline = mdiInformationOutline

const boolShowCommitList = ref(false)
const boolShowUpdateHint = ref(false)
const toggleAnomalies = ref(false)

const name = computed(() => {
    const info_tags = props.repo.info_tags ?? []
    const description = info_tags.find((tag) => tag.startsWith('desc='))
    if (description && description.trim() !== 'desc=') return description.replace('desc=', '').trim()
    return props.repo.name ?? 'UNKNOWN'
})

const type = computed(() => props.repo.configured_type)

const localVersion = computed(() => {
    const version = props.repo.version ?? '?'
    if (!semver.valid(version, { loose: true })) return null
    return version
})

const remoteVersion = computed(() => {
    const version = props.repo.remote_version ?? '?'
    if (!semver.valid(version, { loose: true })) return null
    return version
})

const branch = computed(() => props.repo.branch ?? 'master')

const remoteAlias = computed(() => props.repo.remote_alias ?? 'origin')

const branchOutput = computed(() => {
    if (remoteAlias.value !== 'origin') return `${remoteAlias.value}/${branch.value}`
    if (!['master', 'main'].includes(branch.value)) return branch.value
    return null
})

const commitsBehind = computed(() => props.repo.commits_behind ?? [])

const fullVersionString = computed(() => props.repo.full_version_string ?? null)

const versionOutput = computed(() => {
    const output = branchOutput.value ? `${branchOutput.value}: ` : ''
    if (semverUpdatable.value) {
        return `${output}${localVersion.value} > ${remoteVersion.value}`
    }
    if (commitsBehind.value.length) {
        const tmp = t('Machine.UpdatePanel.CommitsAvailable', { count: commitsBehind.value.length })
        if (localVersion.value) return `${output}${localVersion.value} > ${tmp}`
        return `${output}${tmp}`
    }
    if (fullVersionString.value) return fullVersionString.value
    if (localVersion.value) return localVersion.value
    return 'UNKNOWN'
})

const configuredType = computed(() => props.repo.configured_type ?? 'git_repo')

const isValid = computed(() => props.repo.is_valid ?? true)

const isDirty = computed(() => props.repo.is_dirty ?? false)

const isCorrupt = computed(() => {
    if (configuredType.value !== 'git_repo') return false
    return props.repo.corrupt ?? false
})

const debugEnabled = computed(() => props.repo.debug_enabled ?? false)

const isDetached = computed(() => {
    if (configuredType.value !== 'git_repo') return false
    return !debugEnabled.value && (props.repo.detached ?? false)
})

const existsRecoveryUrl = computed(() => {
    const url = props.repo.recovery_url ?? '?'
    return url !== '?'
})

const btnDisabled = computed(() => {
    if (['printing', 'paused'].includes(printer_state.value)) return true
    if (!isValid.value || isCorrupt.value || isDirty.value || commitsBehind.value.length) return false
    if (['python', 'web'].includes(type.value)) return !semverUpdatable.value
    return commitsBehind.value.length === 0
})

const btnIcon = computed(() => {
    if (isDetached.value || !isValid.value || isCorrupt.value || isDirty.value) return mdiCloseCircle
    if (['python', 'web'].includes(type.value)) {
        if (semverUpdatable.value) return mdiProgressUpload
        else if (localVersion.value === null || remoteVersion.value === null) return mdiHelpCircleOutline
    }
    if (type.value === 'git_repo' && commitsBehind.value.length) return mdiProgressUpload
    return mdiCheck
})

const btnColor = computed(() => {
    if (isCorrupt.value || isDetached.value || isDirty.value || !isValid.value) return 'orange'
    if (['python', 'web'].includes(type.value) && semverUpdatable.value) return 'primary'
    if (type.value === 'git_repo' && commitsBehind.value.length) return 'primary'
    return 'green'
})

const btnText = computed(() => {
    if (isCorrupt.value) return t('Machine.UpdatePanel.Corrupt')
    if (isDetached.value) return t('Machine.UpdatePanel.Detached')
    if (isDirty.value) return t('Machine.UpdatePanel.Dirty')
    if (!isValid.value) return t('Machine.UpdatePanel.Invalid')
    if (['python', 'web'].includes(type.value)) {
        if (semverUpdatable.value) return t('Machine.UpdatePanel.Update')
        else if (localVersion.value === null || remoteVersion.value === null)
            return t('Machine.UpdatePanel.Unknown')
    }
    if (type.value === 'git_repo' && commitsBehind.value.length) return t('Machine.UpdatePanel.Update')
    return t('Machine.UpdatePanel.UpToDate')
})

const anomalies = computed(() => props.repo.anomalies ?? [])

const warnings = computed(() => props.repo.warnings ?? [])

const semverUpdatable = computed(() => {
    if (!localVersion.value) return false
    if (!remoteVersion.value) return false
    return semver.gt(remoteVersion.value, localVersion.value, { loose: true })
})

const repo_name = computed(() => props.repo.repo_name ?? props.repo.name ?? '')

const githubRepoUrl = computed(() =>
    `https://github.com/${props.repo.owner}/${repo_name.value}`
)

const webLinkRelease = computed(() =>
    `${githubRepoUrl.value}/releases/tag/${props.repo.remote_version}`
)

const pythonChangelog = computed(() => {
    if (props.repo.channel === 'dev')
        return `${githubRepoUrl.value}/compare/${props.repo.current_hash}..${props.repo.remote_hash}`
    if (props.repo.changelog_url) return props.repo.changelog_url
    return webLinkRelease.value
})

const hideUpdateWarning = computed(() =>
    store.state.gui.uiSettings.hideUpdateWarnings ?? false
)

function clickUpdate() {
    if (hideUpdateWarning.value) {
        doUpdate()
        return
    }
    boolShowUpdateHint.value = true
}

function doUpdate() {
    if (['klipper', 'moonraker'].includes(props.repo.name)) {
        socket.emit('machine.update.' + props.repo.name, {})
        return
    }
    socket.emit('machine.update.client', { name: props.repo.name })
}

function doRecovery(hard: boolean) {
    socket.emit('machine.update.recover', { name: props.repo.name, hard: hard })
}
</script>

<style scoped></style>
