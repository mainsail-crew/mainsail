<style lang="scss" scoped>
    .cursor--pointer {
        cursor: pointer;
    }

    ul.commits {
        list-style: none;

        li {
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
    }
</style>

<style lang="scss">
    .v-timeline.groupedCommits {
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
                background: rgba(255, 255, 255, 0.50);
                z-index: 1;
            }
        }

        .v-timeline-item__inner-dot {
            background-color: #1e1e1e !important;
            border: 2px solid rgba(255, 255, 255, 0.50) !important;
            width: 8px;
            height: 8px;
            position: relative;
            z-index: 2;
            margin-left: 5px;
            margin-top: 2px;
        }
    }
</style>

<template>
    <div>
        <panel :title="$t('Machine.UpdatePanel.UpdateManager')" v-if="enableUpdateManager" icon="mdi-update" card-class="machine-update-panel" :collapsible="true">
            <template v-slot:buttons>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon tile color="primary" :ripple="true" :loading="loadings.includes('loadingBtnSyncUpdateManager')" :disabled="['printing', 'paused'].includes(printer_state)" @click="btnSync" v-bind="attrs" v-on="on"><v-icon>mdi-refresh</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Machine.UpdatePanel.CheckForUpdates') }}</span>
                </v-tooltip>
            </template>
            <v-card-text class="px-0 py-0">
                <v-container py-0 px-0>
                    <div v-for="(value, key, index) of updateableSoftwares" v-bind:key="key">
                        <v-divider class="my-0" v-if="index" ></v-divider>
                        <v-row class="py-2">
                            <v-col class="pl-6">
                                <strong>{{ 'name' in value ? value.name : key }}</strong><br />
                                <span @click="openCommitsOverlay(key, value)" :class="getVersionClickable(value) ? 'primary--text cursor--pointer' : ''"><v-icon v-if="getVersionClickable(value)" small color="primary" class="mr-1">mdi-information</v-icon>{{ getVersionOutput(value) }}</span>
                            </v-col>
                            <v-col class="col-auto pr-6 text-right" align-self="center">
                                <template v-if="getRecoveryOptions(value)">
                                    <v-menu :offset-y="true" title="Webcam">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-chip
                                                small
                                                label
                                                outlined
                                                :color="getBtnColor(value)"
                                                :disabled="getBtnDisabled(value)"
                                                class="minwidth-0 px-2 text-uppercase"
                                                v-bind="attrs" v-on="on"
                                            >
                                                <v-icon small class="mr-1">mdi-{{ getBtnIcon(value) }}</v-icon>
                                                {{ getBtnText(value) }}
                                                <v-icon small>mdi-menu-down</v-icon>
                                            </v-chip>
                                        </template>
                                        <v-list dense class="py-0">
                                            <v-list-item @click="recovery(key, false)">
                                                <v-list-item-icon class="mr-0">
                                                    <v-icon small>mdi-reload</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                    <v-list-item-title>Soft Recovery</v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item @click="recovery(key,true)">
                                                <v-list-item-icon class="mr-0">
                                                    <v-icon small>mdi-reload</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                    <v-list-item-title>Hard Recovery</v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </template>
                                <template v-else>
                                    <v-chip
                                        small
                                        label
                                        outlined
                                        :color="getBtnColor(value)"
                                        @click="updateModule(key)"
                                        :disabled="getBtnDisabled(value)"
                                        class="minwidth-0 px-2 text-uppercase"
                                    ><v-icon small class="mr-1">mdi-{{ getBtnIcon(value) }}</v-icon>{{ getBtnText(value) }}</v-chip>
                                </template>
                            </v-col>
                        </v-row>
                    </div>
                    <template v-if="'system' in version_info">
                        <v-divider class="my-0 border-top-2" ></v-divider>
                        <v-row class="pt-2">
                            <v-col class="col-auto pl-6 text-no-wrap">
                                <strong>{{ $t('Machine.UpdatePanel.System') }}</strong><br />
                                <v-tooltip top v-if="version_info.system.package_count > 0" :max-width="300">
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">{{ version_info.system.package_count }} {{ $t('Machine.UpdatePanel.PackagesCanBeUpgraded') }}</span>
                                    </template>
                                    <span>{{ version_info.system.package_list.join(', ') }}</span>
                                </v-tooltip>
                                <span v-if="version_info.system.package_count === 0">{{ $t('Machine.UpdatePanel.OSPackages') }}</span>
                            </v-col>
                            <v-col class="pr-6 text-right" align-self="center">
                                <v-chip
                                    small
                                    label
                                    outlined
                                    :color="version_info.system.package_count ? 'primary' : 'green'"
                                    :disabled="!(version_info.system.package_count) || printer_state === 'printing'"
                                    @click="updateSystem"
                                    class="minwidth-0 px-2 text-uppercase"
                                ><v-icon small class="mr-1">mdi-{{ version_info.system.package_count ? 'progress-upload' : 'check' }}</v-icon>{{ version_info.system.package_count ? $t('Machine.UpdatePanel.Upgrade') : $t('Machine.UpdatePanel.UpToDate') }}</v-chip>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-if="showUpdateAll">
                        <v-divider class="mb-0 mt-2 border-top-2" ></v-divider>
                        <v-row class="pt-3">
                            <v-col class="text-center">
                                <v-btn text color="primary" small @click="updateAll" :disabled="['printing', 'paused'].includes(this.printer_state)">
                                    <v-icon left>mdi-progress-upload</v-icon>
                                    {{ $t('Machine.UpdatePanel.UpdateAll') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-container>
            </v-card-text>
        </panel>
        <v-dialog v-model="commitsOverlay.bool" persistent max-width="800">
            <panel :title="$t('Machine.UpdatePanel.Commits')" icon="mdi-update" :margin-bottom="false" card-class="machine-update-commits-dialog">
                <template v-slot:buttons>
                    <v-btn icon tile @click="commitsOverlay.bool = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="py-0 px-0">
                    <overlay-scrollbars style="max-height: 400px;" :options="{ overflowBehavior: { x: 'hidden' } }">
                        <v-row>
                            <v-col class="pt-3 pl-0">
                                <v-timeline class="groupedCommits" align-top dense >
                                    <v-timeline-item small v-for="group of commitsOverlay.groupedCommits" v-bind:key="group.date.getTime()">
                                        <v-row class="pt-0">
                                            <v-col class="pr-12">
                                                <h3 class="caption">{{ $t('Machine.UpdatePanel.CommitsOnDate', {date : new Date(group.date).toLocaleDateString(language, dateOptions) }) }}</h3>
                                                <ul class="commits mt-3 pl-0">
                                                    <li class="commit px-3 py-2" v-for="commit of group.commits" v-bind:key="commit.sha">
                                                        <v-row>
                                                            <v-col>
                                                                <h4 class="subtitle-2 text--white mb-0" >{{ commit.subject }}<v-chip outlined label x-small class="ml-2 px-2" v-if="!openCommits.includes(commit.sha)" @click="openCommits.push(commit.sha)"><v-icon small>mdi-dots-horizontal</v-icon></v-chip></h4>
                                                                <p v-if="openCommits.includes(commit.sha)" class="caption text--secondary mb-2" style="white-space: pre-line;" v-html="commit.message"></p>
                                                                <p class="caption mb-0"><span class="font-weight-bold text-decoration-none white--text">{{ commit.author}}</span> <span>{{ convertCommitDate(commit.date) }}</span></p>
                                                            </v-col>
                                                            <v-col class="col-auto pt-4 ">
                                                                <v-chip outlined label small :href="'https://github.com/'+commitsOverlay.owner+'/'+commitsOverlay.repoName+'/commit/'+commit.sha" target="_blank">{{ commit.sha.substr(0, 6)}}</v-chip>
                                                            </v-col>
                                                        </v-row>
                                                    </li>
                                                </ul>
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
    </div>
</template>

<script lang="ts">


import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import semver from 'semver'
import Panel from '@/components/ui/Panel.vue'
import {ServerUpdateMangerStateVersionInfoGitRepoCommits} from '@/store/server/updateManager/types'
import VueI18n from 'vue-i18n'
import DateTimeFormatOptions = VueI18n.DateTimeFormatOptions

interface groupedCommit {
    date: Date,
    commits: ServerUpdateMangerStateVersionInfoGitRepoCommits[]
}

interface commitsOverlay {
    bool: boolean
    owner: string
    modul: string
    repoName: string
    commits: ServerUpdateMangerStateVersionInfoGitRepoCommits[]
    groupedCommits: groupedCommit[]
}

@Component({
    components: {Panel}
})
export default class UpdatePanel extends Mixins(BaseMixin) {
    private openCommits: string[] = []

    private dateOptions: DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }

    private commitsOverlay: commitsOverlay = {
        bool: false,
        owner: '',
        modul: '',
        repoName: '',
        commits: [],
        groupedCommits: []
    }

    get language() {
        return this.$store.state.gui.general.language ?? 'en'
    }

    get enableUpdateManager() {
        return this.$store.state.server.components.includes('update_manager')
    }

    get version_info() {
        return this.$store.state.server.updateManager.version_info
    }

    get updateableSoftwares() {
        return this.$store.getters['server/updateManager/getUpdateableSoftwares']
    }

    get showUpdateAll() {
        let updateableModuls = 0

        Object.keys(this.updateableSoftwares).forEach((modulename) => {
            const module = this.updateableSoftwares[modulename]
            if (
                'version' in module &&
                'remote_version' in module &&
                semver.valid(module.remote_version) &&
                semver.valid(module.version) &&
                semver.gt(module.remote_version, module.version)
            ) updateableModuls++
        })

        if (this.version_info?.system?.package_count > 0) updateableModuls++
        return (updateableModuls > 1)
    }

    btnSync() {
        this.$socket.emit('machine.update.status', { refresh: true }, { action: 'server/updateManager/getStatus', loading: 'loadingBtnSyncUpdateManager' })
    }

    getBtnColor(object: any) {
        if (typeof object === 'object' && object !== false) {
            if (
                'debug_enabled' in object &&
                !object.debug_enabled &&
                'detached' in object &&
                object.detached
            ) return 'orange'
            if ('is_dirty' in object && object.is_dirty) return 'orange'
            if ('is_valid' in object && !object.is_valid) return 'red'

            if (
                'version' in object &&
                'remote_version' in object &&
                semver.valid(object.remote_version) &&
                semver.valid(object.version) &&
                semver.gt(object.remote_version, object.version)
            ) return 'primary'

            if ((object.commits_behind ?? []).length) return 'primary'

            if (
                'version' in object &&
                'remote_version' in object && (
                    object.version === '?' || object.remote_version === '?'
                )
            ) return 'gray'

            return 'green'
        }

        return 'red'
    }

    getBtnText(object: any) {
        if (typeof object === 'object' && object !== false) {
            if (
                'debug_enabled' in object &&
                !object.debug_enabled &&
                'detached' in object &&
                object.detached
            ) return this.$t('Machine.UpdatePanel.Detached')
            if ('is_valid' in object && !object.is_valid) return this.$t('Machine.UpdatePanel.Invalid')
            if ('is_dirty' in object && object.is_dirty) return this.$t('Machine.UpdatePanel.Dirty')

            if (
                'version' in object &&
                'remote_version' in object &&
                semver.valid(object.remote_version) &&
                semver.valid(object.version) &&
                semver.gt(object.remote_version, object.version)
            ) return this.$t('Machine.UpdatePanel.Update')

            if ((object.commits_behind ?? []).length) return this.$t('Machine.UpdatePanel.Update')

            if (
                'version' in object &&
                'remote_version' in object && (
                    object.version === '?' || object.remote_version === '?'
                )
            ) return this.$t('Machine.UpdatePanel.Unknown')

            return this.$t('Machine.UpdatePanel.UpToDate')
        }

        return this.$t('Machine.UpdatePanel.ERROR')
    }

    getBtnIcon(object: any) {
        if (typeof object === 'object' && object !== false) {
            if (
                'debug_enabled' in object &&
                !object.debug_enabled &&
                'detached' in object &&
                object.detached
            ) return 'alert-circle'
            if ('is_valid' in object && !object.is_valid) return 'alert-circle'
            if ('is_dirty' in object && object.is_dirty) return 'alert-circle'

            if (
                'version' in object &&
                'remote_version' in object &&
                semver.valid(object.remote_version) &&
                semver.valid(object.version) &&
                semver.gt(object.remote_version, object.version)
            ) return 'progress-upload'

            if ((object.commits_behind ?? []).length) return 'progress-upload'

            if (
                'version' in object &&
                'remote_version' in object && (
                    object.version === '?' || object.remote_version === '?'
                )
            ) return 'help-circle-outline'

            return 'check'
        }

        return 'ERROR'
    }

    getBtnDisabled(object: any) {
        if (['printing', 'paused'].includes(this.printer_state)) return true

        if ('is_valid' in object && !object.is_valid) return false
        if ('is_dirty' in object && object.is_dirty) return false

        if (typeof object === 'object' && object !== false) {
            if ((object.commits_behind ?? []).length) return false

            if (
                'version' in object &&
                'remote_version' in object &&
                semver.valid(object.remote_version) &&
                semver.valid(object.version) &&
                semver.gt(object.remote_version, object.version)
            ) return false
        }

        return true
    }

    getVersionOutput(object: any) {
        const local_version = object.version ?? '?'
        const remote_version =  object.remote_version ?? '?'
        const commits_behind = object.commits_behind ?? []

        let output = ''
        if ('remote_alias' in object && object.remote_alias !== 'origin') output += object.remote_alias
        if ('branch' in object && !['master', 'main'].includes(object.branch)) {
            if (output !== '') output += '/'

            output += object.branch
        }
        if (output !== '') output += ': '

        if (semver.valid(remote_version) && semver.valid(local_version) && semver.gt(remote_version, local_version))
            output += local_version+' > '+remote_version
        else if (commits_behind.length)
            output += local_version+' > '+ this.$tc('Machine.UpdatePanel.CommitsAvailabe', commits_behind.length, { count: commits_behind.length })
        else if ('full_version_string' in object && object.full_version_string !== '?')
            output += object.full_version_string
        else
            output += local_version

        return output
    }

    getVersionClickable(object: any) {
        return (
            'commits_behind' in object &&
            object.commits_behind.length
        )
    }

    getRecoveryOptions(object: any) {
        if ('is_valid' in object && !object.is_valid) return true
        else if ('is_dirty' in object && object.is_dirty) return true

        return false
    }

    updateAll() {
        this.$socket.emit('machine.update.full', {  })
    }

    updateModule(key: string) {
        if (['klipper', 'moonraker'].includes(key)) this.$socket.emit('machine.update.'+key, { })
        else this.$socket.emit('machine.update.client', { name: key })
    }

    recovery(name: string, hard: boolean) {
        this.$socket.emit('machine.update.recover', { name: name, hard: hard })
    }

    updateSystem() {
        this.$socket.emit('machine.update.system', { })
    }

    openCommitsOverlay(key: string, object: any) {
        if (
            'commits_behind' in object &&
            'owner' in object &&
            object.commits_behind.length
        ) {
            this.openCommits = []
            this.commitsOverlay.owner = object.owner
            this.commitsOverlay.modul = key
            this.commitsOverlay.repoName = object.repo_name ?? key
            this.commitsOverlay.commits = object.commits_behind
            this.commitsOverlay.groupedCommits = []

            let lastDate: null | Date = null
            let tmpCommits: ServerUpdateMangerStateVersionInfoGitRepoCommits[] = []

            object.commits_behind.forEach((commit: any) => {
                const commitDate = new Date(commit.date * 1000)
                if (lastDate === null ||
                    commitDate.getFullYear() !== lastDate.getFullYear() ||
                    commitDate.getMonth() !== lastDate.getMonth() ||
                    commitDate.getDay() !== lastDate.getDay()
                ) {

                    if (tmpCommits.length && lastDate !== null) {
                        this.commitsOverlay.groupedCommits.push({
                            date: lastDate,
                            commits: [...tmpCommits]
                        })
                    }

                    lastDate = commitDate
                    tmpCommits = []
                }

                tmpCommits.push(commit)
            })

            if (lastDate && tmpCommits.length) {
                this.commitsOverlay.groupedCommits.push({
                    date: lastDate,
                    commits: [...tmpCommits]
                })
            }

            this.commitsOverlay.bool = true
        }
    }

    convertCommitDate(timestamp: number) {
        const commitDay = new Date(timestamp * 1000)
        commitDay.setHours(0,0,0,0)
        const todayDay = new Date()
        todayDay.setHours(0,0,0,0)
        const diff = Math.floor(todayDay.getTime() - commitDay.getTime()) / (1000 * 60 * 60 * 24)

        if (diff === 0) {
            const diffHours = Math.floor(((new Date()).getTime() - timestamp * 1000) / (1000 * 60 * 60))

            return this.$t('Machine.UpdatePanel.CommittedHoursAgo', { hours: diffHours })
        }
        else if (diff === 1) return this.$t('Machine.UpdatePanel.CommittedYesterday')
        else if (diff < 29) return this.$t('Machine.UpdatePanel.CommittedDaysAgo', { days: diff })
        else return this.$t('Machine.UpdatePanel.CommittedOnDate', { date: commitDay.toLocaleDateString(this.language, this.dateOptions) })
    }
}
</script>