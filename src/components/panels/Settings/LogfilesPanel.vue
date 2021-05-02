<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-file-document-edit</v-icon>{{ $t("Settings.LogfilesPanel.Logfiles")}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text :class="'text-center text-lg-left py-0'">
            <v-container pb-0 px-0>
                <v-row>
                    <v-col :class="'col-12' +(klippy_state !== 'ready' ? 'col-md-6' : 'col-md-12')+ ''">
                        <v-btn :href="'//'+hostname+':'+port+'/server/files/klippy.log'" @click="downloadLog" block color="primary"><v-icon class="mr-2">mdi-download</v-icon>Klipper</v-btn>
                    </v-col>
                    <v-col :class="'col-12 pt-0 ' +(klippy_state !== 'ready' ? 'col-md-6 mt-md-3 ' : 'col-md-12')+ ''">
                        <v-btn :href="'//'+hostname+':'+port+'/server/files/moonraker.log'" @click="downloadLog" block color="primary"><v-icon class="mr-2">mdi-download</v-icon>Moonraker</v-btn>
                    </v-col>
                </v-row>
            </v-container>
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
        methods: {
            downloadLog(event) {
                event.preventDefault()
                let href = ""
                if ('href' in event.target.attributes) href = event.target.attributes.href.value;
                if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value;

                window.open(href)
            }
        }
    }
</script>