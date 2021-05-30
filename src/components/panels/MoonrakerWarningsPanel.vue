<template>
    <v-card class="mb-6">
        <v-toolbar flat dense color="orange darken-2">
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon class="mdi mdi-alert-circle" left></v-icon>{{ $t("Panels.MoonrakerWarningsPanel.MoonrakerWarnings") }}
                </span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text :class="index > 0 ? 'py-0' : 'pt-3 pb-0'" v-for="(warning, index) in warnings" v-bind:key="warning">
            <v-divider class="my-2" v-if="index"></v-divider>
            <p class="orange--text mb-0">{{ warning }}</p>
        </v-card-text>
        <v-divider class="mb-2 mt-3"></v-divider>
        <v-card-actions class="px-4 pt-2 pb-4 text-center text-lg-left">
            <v-btn small :href="'//'+hostname+':'+port+'/server/files/moonraker.log'" color="primary" class=""><v-icon class="mr-2">mdi-download</v-icon>{{ $t("Panels.MoonrakerWarningsPanel.DownloadLog") }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        data: () => ({

        }),
        computed: {
            ...mapState({
                warnings: state => state.server.warnings,
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
            }),
        },
    }
</script>