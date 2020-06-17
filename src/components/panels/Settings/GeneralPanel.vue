<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-cog</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">General</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pb-0 pt-3 content">
            <v-row>
                <v-col class="px-10 py-0">
                    <v-text-field
                        v-model="printerName"
                        label="Printer Name"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            printerName: {
                get() {
                    return this.$store.state.gui.general.printername;
                },
                set(newName) {
                    return this.$store.dispatch('setSettings', { gui: { general: { printername: newName } } });
                }
            },
        },
        methods: {

        }
    }
</script>