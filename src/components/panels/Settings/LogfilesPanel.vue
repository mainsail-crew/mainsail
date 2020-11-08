<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-file-document-edit</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Logfiles</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class=" text-center text-lg-left">
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
                klippy_state: state => state.printer.webhooks.state,
            }),
        },
    }
</script>