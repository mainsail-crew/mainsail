<template>
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
                        <v-col class="pl-6 text-no-wrap">
                            {{ 'name' in value ? value.name : key }}<br />
                            {{ getVersionOutput(value) }}
                        </v-col>
                        <v-col class="pr-6 text-right">
                            <v-chip
                                small
                                label
                                outlined
                                :color="getBtnColor(value)"
                                @click="updateModule(key)"
                                :disabled="getBtnDisabled(value)"
                                class="minwidth-0 mt-3 px-2 text-uppercase"
                            ><v-icon small class="mr-1">mdi-{{ getBtnIcon(value) }}</v-icon>{{ getBtnText(value) }}</v-chip>
                        </v-col>
                    </v-row>
                </div>
                <div v-if="'system' in version_info">
                    <v-divider class="my-0 border-top-2" ></v-divider>
                    <v-row class="pt-2">
                        <v-col class="pl-6 text-no-wrap">
                            <strong>System</strong><br />
                            <v-tooltip top v-if="version_info.system.package_count > 0" :max-width="300">
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">{{ version_info.system.package_count }} packages can be upgraded</span>
                                </template>
                                <span>{{ version_info.system.package_list.join(', ') }}</span>
                            </v-tooltip>
                            <span v-if="version_info.system.package_count === 0">OS-Packages</span>
                        </v-col>
                        <v-col class="pr-6 text-right">
                            <v-chip
                                small
                                label
                                outlined
                                :color="version_info.system.package_count ? 'primary' : 'green'"
                                :disabled="!(version_info.system.package_count) || printer_state === 'printing'"
                                @click="updateSystem"
                                class="minwidth-0 mt-3 px-2 text-uppercase"
                            ><v-icon small class="mr-1">mdi-{{ version_info.system.package_count ? 'progress-upload' : 'check' }}</v-icon>{{ version_info.system.package_count ? 'upgrade' : 'up-to-date' }}</v-chip>
                        </v-col>
                    </v-row>
                </div>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                package_version: state => state.packageVersion,
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

                    if ('version' in object && 'remote_version' in object && object.version !== object.remote_version) return 'primary'

                    return 'green'
                }

                return 'red'
            },
            getBtnText(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('detached' in object && object.detached) return 'detached'
                    if ('is_valid' in object && !object.is_valid) return 'invalid'
                    if ('is_dirty' in object && object.is_dirty) return 'dirty'

                    if ('version' in object && 'remote_version' in object && object.version !== object.remote_version) return 'update'

                    return 'up-to-date'
                }

                return 'ERROR'
            },
            getBtnIcon(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('detached' in object && object.detached) return 'alert-circle'
                    if ('is_valid' in object && !object.is_valid) return 'alert-circle'
                    if ('is_dirty' in object && object.is_dirty) return 'alert-circle'

                    if ('version' in object && 'remote_version' in object && object.version !== object.remote_version) return 'progress-upload'

                    return 'check'
                }

                return 'ERROR'
            },
            getBtnDisabled(object) {
                if (['printing', 'paused'].includes(this.printer_state)) return true
                if ('detached' in object && object.detached) return true

                if (typeof object === 'object' && object !== false) {
                    if ('is_valid' in object && !object.is_valid) return true
                    if ('version' in object && 'remote_version' in object && object.version !== object.remote_version) return false
                }

                return true
            },
            getVersionOutput(object) {
                const local_version = 'version' in object ? object.version : '?'
                const remote_version = 'remote_version' in object ? object.remote_version : '?'

                return local_version !== remote_version ? local_version+" > "+remote_version : local_version
            },
            updateModule(key) {
                if (["klipper", "moonraker"].includes(key)) this.$socket.sendObj('machine.update.'+key, { })
                else this.$socket.sendObj('machine.update.client', { name: key })
            },
            updateSystem() {
                this.$socket.sendObj('machine.update.system', { })
            },
        }
    }
</script>