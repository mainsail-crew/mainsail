<template>
    <div>
        <v-row class="py-2">
            <v-col class="pl-6">
                <strong>{{ repo.name }}</strong>
                <br />
                <template v-if="type === 'git_repo' && commitsBehind.length">
                    <a class="primary--text cursor--pointer" @click="boolShowCommitList = true">
                        <v-icon small color="primary" class="mr-1">{{ mdiInformation }}</v-icon>
                        {{ versionOutput }}
                    </a>
                </template>
                <template v-else-if="type === 'web' && webUpdatable">
                    <a class="primary--text text-decoration-none" :href="webLinkRelease" target="_blank">
                        <v-icon small color="primary" class="mr-1">{{ mdiInformation }}</v-icon>
                        {{ versionOutput }}
                    </a>
                </template>
                <span v-else>{{ versionOutput }}</span>
            </v-col>
            <v-col class="col-auto pr-6 text-right" align-self="center">
                <template v-if="needsRecovery">
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
                            <v-list-item @click="doRecovery(false)">
                                <v-list-item-icon class="mr-0">
                                    <v-icon small>{{ mdiReload }}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t('Machine.UpdatePanel.SoftRecovery') }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item @click="doRecovery(true)">
                                <v-list-item-icon class="mr-0">
                                    <v-icon small>{{ mdiReload }}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t('Machine.UpdatePanel.HardRecovery') }}</v-list-item-title>
                                </v-list-item-content>
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
                    @click="boolShowUpdateHint = true">
                    <v-icon small class="mr-1">{{ btnIcon }}</v-icon>
                    {{ btnText }}
                </v-chip>
            </v-col>
        </v-row>
        <v-row v-if="notificationText" class="mt-0">
            <v-col class="px-6 pt-0">
                <v-alert text dense :color="notificationColor" :icon="notificationIcon" border="left">
                    {{ notificationText }}
                </v-alert>
            </v-col>
        </v-row>
        <v-row v-if="gitMessages.length" class="mt-0">
            <v-col class="px-6 pt-0">
                <v-alert
                    v-for="(message, index) in gitMessages"
                    :key="'message_' + index"
                    text
                    dense
                    border="left"
                    color="orange"
                    :icon="mdiAlertCircle">
                    {{ message }}
                </v-alert>
            </v-col>
        </v-row>
        <git-commits-list
            v-if="type === 'git_repo'"
            :bool-show-dialog="boolShowCommitList"
            :repo="repo"
            @close-dialog="closeCommitList" />
        <update-hint
            :bool-show-dialog="boolShowUpdateHint"
            :repo="repo"
            @open-commit-history="boolShowCommitList = true"
            @do-update="doUpdate"
            @close-dialog="closeShowUpdateHint" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerUpdateManagerStateGitRepo } from '@/store/server/updateManager/types'
import {
    mdiAlertCircle,
    mdiCheck,
    mdiHelpCircleOutline,
    mdiInformation,
    mdiMenuDown,
    mdiProgressUpload,
    mdiReload,
} from '@mdi/js'
import semver from 'semver'
import GitCommitsList from '@/components/panels/Machine/UpdatePanel/GitCommitsList.vue'
import UpdateHint from '@/components/panels/Machine/UpdatePanel/UpdateHint.vue'
@Component({
    components: { GitCommitsList, UpdateHint },
})
export default class UpdatePanelEntry extends Mixins(BaseMixin) {
    mdiInformation = mdiInformation
    mdiMenuDown = mdiMenuDown
    mdiReload = mdiReload
    mdiAlertCircle = mdiAlertCircle

    boolShowCommitList = false
    boolShowUpdateHint = false

    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo

    get name() {
        return this.repo.name ?? 'UNKNOWN'
    }

    get type() {
        return this.repo.configured_type
    }

    get localVersion() {
        const version = this.repo.version ?? '?'

        if (!semver.valid(version)) return null

        return version
    }

    get remoteVersion() {
        const version = this.repo.remote_version ?? '?'

        if (!semver.valid(version)) return null

        return version
    }

    get branch() {
        return this.repo.branch ?? 'master'
    }

    get remoteAlias() {
        return this.repo.remote_alias ?? 'origin'
    }

    get branchOutput() {
        if (this.remoteAlias !== 'origin') return `${this.remoteAlias}/${this.branch}`
        if (!['master', 'main'].includes(this.branch)) return this.branch

        return null
    }

    get commitsBehind() {
        return this.repo.commits_behind ?? []
    }

    get fullVersionString() {
        return this.repo.full_version_string ?? null
    }

    get versionOutput() {
        let output = this.branchOutput ? `${this.branchOutput}: ` : ''

        if (this.localVersion && this.remoteVersion && semver.gt(this.remoteVersion, this.localVersion)) {
            return `${output}${this.localVersion} > ${this.remoteVersion}`
        }

        if (this.commitsBehind.length) {
            const tmp = this.$tc('Machine.UpdatePanel.CommitsAvailable', this.commitsBehind.length, {
                count: this.commitsBehind.length,
            }).toString()

            if (this.localVersion) return `${output}${this.localVersion} > ${tmp}`

            return `${output}${tmp}`
        }

        if (this.fullVersionString) return this.fullVersionString
        if (this.localVersion) return this.localVersion

        return 'UNKNOWN'
    }

    get configuredType() {
        return this.repo.configured_type ?? 'git_repo'
    }

    get isValid() {
        return this.repo.is_valid ?? true
    }

    get isDirty() {
        return this.repo.is_dirty ?? false
    }

    get debugEnabled() {
        return this.repo.debug_enabled ?? false
    }

    get isDetached() {
        if (this.configuredType !== 'git_repo') return false

        return !this.debugEnabled && (this.repo.detached ?? false)
    }

    get needsRecovery() {
        return !this.isValid || this.isDirty
    }

    get btnDisabled() {
        if (['printing', 'paused'].includes(this.printer_state)) return true
        if (!this.isValid || this.isDirty || this.commitsBehind.length) return false

        return !(this.localVersion && this.remoteVersion && semver.gt(this.remoteVersion, this.localVersion))
    }

    get btnIcon() {
        if (this.isDetached || !this.isValid || this.isDirty) return mdiAlertCircle

        if (
            this.commitsBehind.length ||
            (this.localVersion && this.remoteVersion && semver.gt(this.remoteVersion, this.localVersion))
        )
            return mdiProgressUpload

        if (this.localVersion === null || this.remoteVersion === null) return mdiHelpCircleOutline

        return mdiCheck
    }

    get btnColor() {
        if (this.isDetached || !this.isValid) return 'orange'
        if (this.isDirty) return 'red'

        if (
            this.commitsBehind.length ||
            (this.localVersion && this.remoteVersion && semver.gt(this.remoteVersion, this.localVersion))
        )
            return 'primary'

        return 'green'
    }

    get btnText() {
        if (this.isDetached) return this.$t('Machine.UpdatePanel.Detached')
        if (!this.isValid) return this.$t('Machine.UpdatePanel.Invalid')
        if (this.isDirty) return this.$t('Machine.UpdatePanel.Dirty')
        if (
            this.commitsBehind.length ||
            (this.localVersion && this.remoteVersion && semver.gt(this.remoteVersion, this.localVersion))
        )
            return this.$t('Machine.UpdatePanel.Update')

        if (this.localVersion === null || this.remoteVersion === null) return this.$t('Machine.UpdatePanel.Unknown')

        return this.$t('Machine.UpdatePanel.UpToDate')
    }

    get notificationText() {
        if (this.isDetached) return this.$t('Machine.UpdatePanel.Notification.Detached')
        if (this.isDirty) return this.$t('Machine.UpdatePanel.Notification.Dirty')

        return null
    }

    get notificationColor() {
        return this.btnColor
    }

    get notificationIcon() {
        return this.btnIcon
    }

    get gitMessages() {
        return this.repo.git_messages ?? []
    }

    get webUpdatable() {
        if (!this.localVersion) return false
        if (!this.remoteVersion) return false

        return semver.gt(this.remoteVersion, this.localVersion)
    }

    get webLinkRelease() {
        return `https://github.com/${this.repo.owner}/${this.repo.name}/releases/tag/${this.repo.remote_version}`
    }

    doUpdate() {
        if (['klipper', 'moonraker'].includes(this.repo.name)) {
            this.$socket.emit('machine.update.' + this.repo.name, {})
            return
        }

        this.$socket.emit('machine.update.client', { name: this.repo.name })
    }

    doRecovery(hard: boolean) {
        this.$socket.emit('machine.update.recover', { name: this.repo.name, hard: hard })
    }

    closeCommitList() {
        this.boolShowCommitList = false
    }

    closeShowUpdateHint() {
        this.boolShowUpdateHint = false
    }
}
</script>

<style scoped></style>
