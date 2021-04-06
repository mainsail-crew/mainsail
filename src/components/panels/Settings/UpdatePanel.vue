<style scoped>
    .cursor--pointer {
        cursor: pointer;
    }
</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-update</v-icon>{{ $t('Settings.UpdatePanel.UpdateManager') }}</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="primary" :loading="loadings.includes('loadingBtnSyncUpdateManager')" :disabled="['printing', 'paused'].includes(printer_state)" @click="btnSync" v-bind="attrs" v-on="on"><v-icon small>mdi-refresh</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Settings.UpdatePanel.CheckForUpdates') }}</span>
                </v-tooltip>
            </v-toolbar>
            <v-card-text class="px-0 py-0">
                <v-container py-0 px-0>

                    <div v-for="(value, key, index) of updateableSoftwares" v-bind:key="key">
                        <v-divider class="my-0" v-if="index" ></v-divider>
                        <v-row class="py-2">
                            <v-col class="pl-6">
                                <strong>{{ 'name' in value ? value.name : key }}</strong><br />
                                <span @click="openCommitsOverlay(key, value)" :class="getVersionClickable(value) ? 'primary--text cursor--pointer' : ''"><v-icon v-if="getVersionClickable(value)" small color="primary" class="mr-1">mdi mdi-information</v-icon>{{ getVersionOutput(value) }}</span>
                            </v-col>
                            <v-col class="col-auto pr-6 text-right" align-self="center">
                                <template v-if="getRecoveryOptions(value)">
                                    <v-item-group>
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
                                    </v-item-group>
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
                    <div v-if="'system' in version_info">
                        <v-divider class="my-0 border-top-2" ></v-divider>
                        <v-row class="pt-2">
                            <v-col class="col-auto pl-6 text-no-wrap">
                                <strong>{{ $t('Settings.UpdatePanel.System') }}</strong><br />
                                <v-tooltip top v-if="version_info.system.package_count > 0" :max-width="300">
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">{{ version_info.system.package_count }} {{ $t('Settings.UpdatePanel.PackagesCanBeUpgraded') }}</span>
                                    </template>
                                    <span>{{ version_info.system.package_list.join(', ') }}</span>
                                </v-tooltip>
                                <span v-if="version_info.system.package_count === 0">{{ $t('Settings.UpdatePanel.OSPackages') }}</span>
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
                                ><v-icon small class="mr-1">mdi-{{ version_info.system.package_count ? 'progress-upload' : 'check' }}</v-icon>{{ version_info.system.package_count ? $t('Settings.UpdatePanel.Upgrade') : $t('Settings.UpdatePanel.UpToDate') }}</v-chip>
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="commitsOverlay.bool" persistent max-width="800">
            <v-card dark>
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-update</v-icon>{{ $t('Settings.UpdatePanel.Commits') }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" color="grey darken-3" @click="commitsOverlay.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="py-0" style="max-height: 400px; overflow-y: scroll;">
                    <v-row>
                        <v-col class="pt-3 pl-0">
                            <v-timeline class="updateManager" align-top dense >
                                <v-timeline-item color="primary" small v-for="commit of commitsOverlay.commits" v-bind:key="commit.sha">
                                    <v-row class="pt-0">
                                        <v-col>
                                            <a class="font-weight-bold white--text" :href="'https://github.com/'+commitsOverlay.owner+'/'+commitsOverlay.modul+'/commit/'+commit.sha" target="_blank">{{ commit.subject }}</a><br />
                                            <p v-if="commit.message" class="mb-0" v-html="convertCommitMessage(commit.message)"></p>
                                            <div class="caption">
                                                <strong>{{ commit.author }}</strong> {{ $t('Settings.UpdatePanel.CommittedAt') }} {{ new Date(commit.date * 1000).toLocaleString() }}
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-timeline-item>
                            </v-timeline>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import semver from 'semver'

    export default {
        components: {

        },
        data: function() {
            return {
                commitsOverlay: {
                    bool: false,
                    owner: "",
                    modul: "",
                    commits: [],
                }
            }
        },
        computed: {
            ...mapState({
                loadings: state => state.socket.loadings,
                remoteMode: state => state.socket.remoteMode,
                printer_state: state => state.printer.print_stats.state,
                version_info: state => state.server.updateManager.version_info
            }),
            updateableSoftwares: {
                get() {
                    return this.$store.getters["server/updateManager/getUpdateableSoftwares"]
                }
            }
        },
        methods: {
            btnSync() {
                this.$store.commit('socket/addLoading', { name: 'loadingBtnSyncUpdateManager' });
                this.$socket.sendObj('machine.update.status', { refresh: true }, 'server/updateManager/getStatus')
            },
            getBtnColor(object) {
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

                    if (
                        'version' in object &&
                        'remote_version' in object && (
                            object.version === "?" || object.remote_version === "?"
                        )
                    ) return 'orange'

                    return 'green'
                }

                return 'red'
            },
            getBtnText(object) {
                if (typeof object === 'object' && object !== false) {
                    if (
                        'debug_enabled' in object &&
                        !object.debug_enabled &&
                        'detached' in object &&
                        object.detached
                    ) return this.$t('Settings.UpdatePanel.Detached')
                    if ('is_valid' in object && !object.is_valid) return this.$t('Settings.UpdatePanel.Invalid')
                    if ('is_dirty' in object && object.is_dirty) return this.$t('Settings.UpdatePanel.Dirty')

                    if (
                        'version' in object &&
                        'remote_version' in object &&
                        semver.valid(object.remote_version) &&
                        semver.valid(object.version) &&
                        semver.gt(object.remote_version, object.version)
                    ) return this.$t('Settings.UpdatePanel.Update')

                    if (
                        'version' in object &&
                        'remote_version' in object && (
                            object.version === "?" || object.remote_version === "?"
                        )
                    ) return this.$t('Settings.UpdatePanel.Unknown')

                    return this.$t('Settings.UpdatePanel.UpToDate')
                }

                return this.$t('Settings.UpdatePanel.ERROR')
            },
            getBtnIcon(object) {
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

                    if (
                        'version' in object &&
                        'remote_version' in object && (
                            object.version === "?" || object.remote_version === "?"
                        )
                    ) return 'help-circle-outline'

                    return 'check'
                }

                return 'ERROR'
            },
            getBtnDisabled(object) {
                if (['printing', 'paused'].includes(this.printer_state)) return true

                if ('is_valid' in object && !object.is_valid) return false
                if ('is_dirty' in object && object.is_dirty) return false

                if (typeof object === 'object' && object !== false) {
                    if (
                        'version' in object &&
                        'remote_version' in object &&
                        semver.valid(object.remote_version) &&
                        semver.valid(object.version) &&
                        semver.gt(object.remote_version, object.version)
                    ) return false
                }

                return true
            },
            getVersionOutput(object) {
                const local_version = 'version' in object ? object.version : '?'
                const remote_version = 'remote_version' in object ? object.remote_version : '?'

                let output = ""
                if ('remote_alias' in object && object.remote_alias !== "origin") output += object.remote_alias
                if ('branch' in object && object.branch !== "master") {
                    if (output !== "") output += "/"

                    output += object.branch
                }
                if (output !== "") output += ": "

                if (semver.valid(remote_version) && semver.valid(local_version) && semver.gt(remote_version, local_version))
                    output += local_version+" > "+remote_version
                else
                    output += local_version

                return output
            },
            getVersionClickable(object) {
                return (
                    'commits_behind' in object &&
                    object.commits_behind.length
                )
            },
            getRecoveryOptions(object) {
                if ('is_valid' in object && !object.is_valid) return true
                if ('is_dirty' in object && object.is_dirty) return true

                return false
            },
            updateModule(key) {
                if (["klipper", "moonraker"].includes(key)) this.$socket.sendObj('machine.update.'+key, { })
                else this.$socket.sendObj('machine.update.client', { name: key })
            },
            recovery(name, hard) {
                this.$socket.sendObj('machine.update.recover', { name: name, hard: hard })
            },
            updateSystem() {
                this.$socket.sendObj('machine.update.system', { })
            },
            openCommitsOverlay(key, object) {
                if (
                    'commits_behind' in object &&
                    'owner' in object &&
                    object.commits_behind.length
                ) {
                    this.commitsOverlay.owner = object.owner
                    this.commitsOverlay.modul = key
                    this.commitsOverlay.commits = object.commits_behind

                    this.commitsOverlay.bool = true
                }
            },
            convertCommitMessage(message) {
                const lastIndex = message.lastIndexOf('Signed-off-by:')
                if (lastIndex !== -1) {
                    message = message.substr(0, lastIndex)
                }

                message = this.trimEndLineBreak(message)
                message.replace(/(?:\r\n|\r|\n)/g, '<br />')

                return message
            },
            trimEndLineBreak(message) {
                if (['\n', '\r'].includes(message.substr(-1))) {
                    message = message.substr(0, message.length - 2)
                    this.trimEndLineBreak(message)
                }

                return message
            }
        }
    }
</script>