<template>
    <div>
        <div v-for="(runout, index) of this['printer/getFilamentSwitchSensors']" v-bind:key="index">
            <v-card class="mt-6">
                <v-list-item>
                    <v-list-item-avatar color="grey"><v-icon dark>mdi-printer-3d-nozzle-alert</v-icon></v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="headline">{{ runout.name }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider class="my-2"></v-divider>
                <v-card-text class="px-0 pt-0 pb-2 content">
                    <settings-runout-switch :name="runout.name" :enabled="runout.enabled" :filament_detected="runout.filament_detected"></settings-runout-switch>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import SettingsRunoutSwitch from "../../../inputs/SettingsRunoutSwitch";

    export default {
        components: {
            SettingsRunoutSwitch
        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapGetters([
                'printer/getFilamentSwitchSensors'
            ])
        },
        methods: {

        }
    }
</script>