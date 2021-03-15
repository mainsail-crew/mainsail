<template>
    <v-card
        class="mb-6">
        <v-toolbar flat dense color="orange darken-2">
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon class="mdi mdi-alert-circle" left></v-icon>{{ $t("Panels.MoonrakerFailedPluginsPanel.MoonrakerFailedPlugins") }}
                </span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left">
                    <p class="orange--text">{{ $t("Panels.MoonrakerFailedPluginsPanel.MoonrakerErrorInfo") }}</p>
                    <p class="mb-2 orange--text">{{ $t("Panels.MoonrakerFailedPluginsPanel.FollowingPluginHasAnError") }}</p>
                    <ul class="mt-0 pt-0">
                        <li v-for="plugin in failedPlugins" v-bind:key="plugin" class="orange--text"><code>{{ plugin }}</code></li>
                    </ul>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-4 pt-2 pb-4 content text-center text-lg-left">
            <v-btn small :href="'//'+hostname+':'+port+'/server/files/moonraker.log'" color="primary" class=""><v-icon class="mr-2">mdi-download</v-icon>{{ $t("Panels.MoonrakerFailedPluginsPanel.DownloadLog") }}</v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        data: () => ({

        }),
        computed: {
            ...mapState({
                failedPlugins: state => state.server.failed_plugins,
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
            }),
        },
    }
</script>