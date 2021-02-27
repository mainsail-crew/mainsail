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
                    <span class="subheading"><v-icon left>mdi-update</v-icon>Update Manager</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="primary" :loading="loadings.includes('loadingBtnSyncUpdateManager')" :disabled="['printing', 'paused'].includes(printer_state)" @click="btnSync" v-bind="attrs" v-on="on"><v-icon small>mdi-refresh</v-icon></v-btn>
                    </template>
                    <span>Check for updates</span>
                </v-tooltip>
            </v-toolbar>
            <v-card-text class="px-0 py-0">
                <v-container py-0 px-0>

                    <div v-for="(value, key) of updateableSoftwares" v-bind:key="key">
                        <v-divider class="my-0" ></v-divider>
                        <v-row class="py-2">
                            <v-col class="pl-6">
                                <strong>{{ 'name' in value ? value.name : key }}</strong><br />
                                <span @click="openCommitsOverlay(key, value)" :class="getVersionClickable(value) ? 'primary--text cursor--pointer' : ''">{{ getVersionOutput(value) }}</span>
                            </v-col>
                            <v-col class="col-auto pr-6 text-right" align-self="center">
                                <v-chip
                                    small
                                    label
                                    outlined
                                    :color="getBtnColor(value)"
                                    @click="updateModule(key)"
                                    :disabled="getBtnDisabled(value)"
                                    class="minwidth-0 px-2 text-uppercase"
                                ><v-icon small class="mr-1">mdi-{{ getBtnIcon(value) }}</v-icon>{{ getBtnText(value) }}</v-chip>
                            </v-col>
                        </v-row>
                    </div>
                    <div v-if="'system' in version_info">
                        <v-divider class="my-0 border-top-2" ></v-divider>
                        <v-row class="pt-2">
                            <v-col class="col-auto pl-6 text-no-wrap">
                                <strong>System</strong><br />
                                <v-tooltip top v-if="version_info.system.package_count > 0" :max-width="300">
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">{{ version_info.system.package_count }} packages can be upgraded</span>
                                    </template>
                                    <span>{{ version_info.system.package_list.join(', ') }}</span>
                                </v-tooltip>
                                <span v-if="version_info.system.package_count === 0">OS-Packages</span>
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
                                ><v-icon small class="mr-1">mdi-{{ version_info.system.package_count ? 'progress-upload' : 'check' }}</v-icon>{{ version_info.system.package_count ? 'upgrade' : 'up-to-date' }}</v-chip>
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="commitsOverlay.bool" persistent width="60%" max-width="800">
            <v-card dark>
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-update</v-icon>Commits</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" color="grey darken-3" @click="commitsOverlay.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="py-5" v-if="commitsOverlay.loading">
                    <v-row class="pt-0">
                        <v-col>
                            <v-progress-linear color="primary" indeterminate></v-progress-linear>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-text class="py-0" v-if="!commitsOverlay.loading" style="max-height: 400px; overflow-y: scroll;">
                    <v-row>
                        <v-col class="pt-3 pl-0">
                            <v-timeline align-top dense >
                                <v-timeline-item color="primary" small v-for="commit of commitsOverlay.outputs" v-bind:key="commit.sha">
                                    <v-row class="pt-0">
                                        <v-col>
                                            <a class="font-weight-bold white--text" :href="commit.url" target="_blank">{{ commit.title }}</a><br />
                                            <p v-if="commit.message" class="mb-0" v-html="commit.message.replace(/(?:\r\n|\r|\n)/g, '<br />')"></p>
                                            <div class="caption">
                                                <strong>{{ commit.author }}</strong> committed at {{ commit.date.toLocaleString() }}
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
    import axios from 'axios'

    export default {
        components: {

        },
        data: function() {
            return {
                commitsOverlay: {
                    bool: false,
                    loading: false,
                    response: [],
                    outputs: [],
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
                    if ('detached' in object && object.detached) return 'orange'
                    if ('is_dirty' in object && object.is_dirty) return 'orange'
                    if ('is_valid' in object && !object.is_valid) return 'red'

                    if ('version' in object && 'remote_version' in object && semver.gt(object.remote_version, object.version)) return 'primary'

                    return 'green'
                }

                return 'red'
            },
            getBtnText(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('detached' in object && object.detached) return 'detached'
                    if ('is_valid' in object && !object.is_valid) return 'invalid'
                    if ('is_dirty' in object && object.is_dirty) return 'dirty'

                    if ('version' in object && 'remote_version' in object && semver.gt(object.remote_version, object.version)) return 'update'

                    return 'up-to-date'
                }

                return 'ERROR'
            },
            getBtnIcon(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('detached' in object && object.detached) return 'alert-circle'
                    if ('is_valid' in object && !object.is_valid) return 'alert-circle'
                    if ('is_dirty' in object && object.is_dirty) return 'alert-circle'

                    if ('version' in object && 'remote_version' in object && semver.gt(object.remote_version, object.version)) return 'progress-upload'

                    return 'check'
                }

                return 'ERROR'
            },
            getBtnDisabled(object) {
                if (['printing', 'paused'].includes(this.printer_state)) return true
                if ('detached' in object && object.detached) return true

                if (typeof object === 'object' && object !== false) {
                    if ('is_valid' in object && !object.is_valid) return true
                    if ('version' in object && 'remote_version' in object && semver.gt(object.remote_version, object.version)) return false
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

                output += semver.gt(remote_version, local_version) ? local_version+" > "+remote_version : local_version

                return output
            },
            getVersionClickable(object) {
                return (
                    'branch' in object &&
                    object.branch === "master" &&
                    'current_hash' in object &&
                    'remote_hash' in object &&
                    object.current_hash !== object.remote_hash
                )
            },
            updateModule(key) {
                if (["klipper", "moonraker"].includes(key)) this.$socket.sendObj('machine.update.'+key, { })
                else this.$socket.sendObj('machine.update.client', { name: key })
            },
            updateSystem() {
                this.$socket.sendObj('machine.update.system', { })
            },
            openCommitsOverlay(key, object) {
                if (
                    ['klipper', 'moonraker'].includes(key) &&
                    this.getVersionClickable(object)
                ) {
                    this.commitsOverlay.bool = true
                    this.commitsOverlay.loading = true

                    let owner = ""
                    switch(key) {
                        case 'klipper':
                            owner = "kevinOConnor"
                            break

                        case 'moonraker':
                            owner = "arksine"
                            break
                    }

                    const apiUrl = "https://api.github.com/repos/"+owner+"/"+key+"/commits"
                    if (apiUrl) {
                        axios
                            .get(apiUrl)
                            .then(response => {
                                this.commitsOverlay.response = response
                                this.commitsOverlay.outputs.splice(0, this.commitsOverlay.outputs.length)

                                const index = response.data.findIndex(commit => commit.sha === object.current_hash)
                                if (index !== -1) {
                                    this.commitsOverlay.response = response.data.splice(0, index).sort((a,b) => {
                                        const dataA = new Date(a.commit.author.date)
                                        const dataB = new Date(b.commit.author.date)

                                        return dataB - dataA
                                    })

                                    this.commitsOverlay.response.forEach(commit => {
                                        const date = new Date(commit.commit.author.date)
                                        const author = commit.commit.author.name

                                        const firstIndex = commit.commit.message.indexOf('\n\n')
                                        let lastIndex = commit.commit.message.lastIndexOf('\n\n')
                                        if (firstIndex === lastIndex && commit.commit.message.lastIndexOf('\r') > firstIndex) {
                                            lastIndex = commit.commit.message.lastIndexOf('\r')
                                        }

                                        this.commitsOverlay.outputs.push({
                                            sha: commit.sha,
                                            date: date,
                                            author: author,
                                            url: commit.html_url,
                                            title: commit.commit.message.substr(0, firstIndex),
                                            message: (firstIndex+2 < lastIndex-2) ? commit.commit.message.substr(firstIndex+2, lastIndex-firstIndex-2) : "",
                                            firstIndex: firstIndex,
                                            lastIndex: lastIndex,
                                        })
                                    })
                                }

                                this.commitsOverlay.loading = false
                            })
                    }
                }
            },
        }
    }
</script>