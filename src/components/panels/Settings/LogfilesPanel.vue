<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-file-document-edit</v-icon>Logfiles</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text :class="'text-center text-lg-left pt-4 '+(klippy_state !== 'ready' ? ' pb-3' : 'pb-0')">
            <v-row>
                <v-col :class="'py-0'+(klippy_state !== 'ready' ? ' col-6' : '')">
                    <v-btn :href="'//'+hostname+':'+port+'/server/files/klippy.log'" block color="primary"><v-icon class="mr-2">mdi-download</v-icon>Klipper</v-btn>
                </v-col>
                <v-col :class="'py-0'+(klippy_state !== 'ready' ? ' col-6' : 'mt-3')">
                    <v-btn :href="'//'+hostname+':'+port+'/server/files/moonraker.log'" block color="primary"><v-icon class="mr-2">mdi-download</v-icon>Moonraker</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
                klippy_state: state => state.server.klippy_state,
            }),
        },
    }
</script>