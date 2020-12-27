<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-update</v-icon>Update</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn small class="px-2 minwidth-0" color="primary" :loading="loadings.includes('loadingBtnSyncUpdateManager')" @click="btnSync" v-bind="attrs" v-on="on"><v-icon small>mdi-refresh</v-icon></v-btn>
                </template>
                <span>Check for updates</span>
            </v-tooltip>
        </v-toolbar>
        <v-card-text class="px-0 pt-0 pb-0 content">
            <v-row v-if="'version' in klipper">
                <v-col class="pl-6 py-2 text-no-wrap">
                    <strong>Klipper</strong><br />
                    {{ klipper.version }}
                </v-col>
                <v-col class="pr-6 py-2 text-right">
                    <v-chip
                        small
                        label
                        outlined
                        :color="getColor(klipper)"
                        @click="updateKlipper"
                        :disabled="is_disabled(klipper)"
                        class="minwidth-0 mt-2 px-2 text-uppercase"
                    ><v-icon small class="mr-1">mdi-{{ getIcon(klipper) }}</v-icon>{{ getText(klipper) }}</v-chip>
                </v-col>
            </v-row>
            <div v-if="'version' in moonraker">
                <v-divider class="mt-0 mb-0" ></v-divider>
                <v-row>
                    <v-col class="pl-6 py-2 text-no-wrap">
                        <strong>Moonraker</strong><br />
                        {{ moonraker.version }}
                    </v-col>
                    <v-col class="pr-6 py-2 text-right">
                        <v-chip
                            small
                            label
                            outlined
                            :color="getColor(moonraker)"
                            @click="updateMoonraker"
                            :disabled="is_disabled(moonraker)"
                            class="minwidth-0 mt-2 px-2 text-uppercase"
                        ><v-icon small class="mr-1">mdi-{{ getIcon(moonraker) }}</v-icon>{{ getText(moonraker) }}</v-chip>
                    </v-col>
                </v-row>
            </div>
            <div v-if="mainsail !== false && 'version' in mainsail">
                <v-divider class="mt-0 mb-0" ></v-divider>
                <v-row>
                    <v-col class="pl-6 py-2 text-no-wrap">
                        <strong>Mainsail</strong><br />
                        {{ 'v'+package_version }}
                        <span v-if="!is_disabled(mainsail)"> &gt; {{ mainsail.remote_version.replace('Version ', 'v') }}</span>
                    </v-col>
                    <v-col class="pr-6 py-2 text-right">
                        <v-chip
                            small
                            label
                            outlined
                            :color="getColor(mainsail)"
                            @click="updateMainsail"
                            :disabled="is_disabled(mainsail)"
                            class="minwidth-0 mt-2 px-2 text-uppercase"
                        ><v-icon small class="mr-1">mdi-{{ getIcon(mainsail) }}</v-icon>{{ getText(mainsail) }}</v-chip>
                    </v-col>
                </v-row>
            </div>
            <v-divider class="mt-0 mb-0 border-top-2" ></v-divider>
            <v-row>
                <v-col class="pl-6 py-2 text-no-wrap">
                    <strong>System</strong><br />
                    OS-Packages
                </v-col>
                <v-col class="pr-6 py-2 text-right">
                    <v-chip
                        small
                        label
                        outlined
                        color="gray"
                        @click="updateSystem"
                        class="minwidth-0 mt-2 px-2 text-uppercase"
                    ><v-icon small class="mr-1">mdi-progress-upload</v-icon>upgrade</v-chip>
                </v-col>
            </v-row>
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
                klipper: state => state.server.updateManager.klipper,
                moonraker: state => state.server.updateManager.moonraker,
                loadings: state => state.socket.loadings,
            }),
            mainsail:{
                get() {
                    if ('name' in this.$store.state.server.updateManager.client)
                        return this.$store.state.server.updateManager.client

                    return false
                }
            }
        },
        methods: {
            btnSync() {
                this.$store.commit('socket/addLoading', { name: 'loadingBtnSyncUpdateManager' });
                this.$socket.sendObj('machine.update.status', { refresh: true }, 'server/updateManager/getStatus')
            },
            getColor(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('is_valid' in object && !object.is_valid) return 'red'
                    if ('is_dirty' in object && object.is_dirty) return 'red'

                    if ('current_hash' in object && 'remote_hash' in object && object.current_hash !== object.remote_hash) return 'primary'

                    if ('name' in object && object.name === "mainsail") {
                        if ('v'+this.package_version !== object.remote_version.replace('Version ', 'v')) return 'primary'
                    }

                    return 'green'
                }

                return 'red'
            },
            getText(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('is_valid' in object && !object.is_valid) return 'invalid'
                    if ('is_dirty' in object && object.is_dirty) return 'dirty'

                    if ('current_hash' in object && 'remote_hash' in object && object.current_hash !== object.remote_hash) return 'update'

                    if ('name' in object && object.name === "mainsail") {
                        if ('v'+this.package_version !== object.remote_version.replace('Version ', 'v')) return 'update'
                    }

                    return 'up-to-date'
                }

                return 'ERROR'
            },
            getIcon(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('is_valid' in object && !object.is_valid) return 'alert-circle'
                    if ('is_dirty' in object && object.is_dirty) return 'alert-circle'

                    if ('current_hash' in object && 'remote_hash' in object && object.current_hash !== object.remote_hash) return 'progress-upload'

                    if ('name' in object && object.name === "mainsail") {
                        if ('v'+this.package_version !== object.remote_version.replace('Version ', 'v')) return 'progress-upload'
                    }

                    return 'check'
                }

                return 'ERROR'
            },
            is_disabled(object) {
                if (typeof object === 'object' && object !== false) {
                    if ('current_hash' in object && 'remote_hash' in object && object.current_hash !== object.remote_hash) return false

                    if ('name' in object && object.name === "mainsail") {
                        if ('v'+this.package_version !== object.remote_version.replace('Version ', 'v')) return false
                    }
                }

                return true
            },
            updateKlipper() {
                this.$socket.sendObj('machine.update.klipper', { })
            },
            updateMoonraker() {
                this.$socket.sendObj('machine.update.moonraker', { })
            },
            updateMainsail() {
                this.$socket.sendObj('machine.update.client', { })
            },
            updateSystem() {
                this.$socket.sendObj('machine.update.system', { })
            },
        }
    }
</script>