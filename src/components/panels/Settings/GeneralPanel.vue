<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-cog</v-icon>General</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pt-2 pb-0">
            <v-text-field
                v-model="printerName"
                label="Printer Name"
            ></v-text-field>
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
                    return this.$store.dispatch('gui/setSettings', { general: { printername: newName } });
                }
            },
        },
        methods: {

        }
    }
</script>