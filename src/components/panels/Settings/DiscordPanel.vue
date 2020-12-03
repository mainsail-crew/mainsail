<style>
    .content { overflow: hidden; }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-discord</v-icon>Discord Bot</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="py-3">
            <v-row>
                <v-col class="py-0">
                    <v-text-field
                        v-model="token"
                        hide-details
                        label="token"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-0">
                    <v-text-field
                        v-model="prefix"
                        hide-details
                        label="prefix"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-0">
                    <br>
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
                rotationEnabled: false
            }
        },
        computed: {
            token: {
                get() {
                    return this.$store.state.gui.discord.token;
                },
                set(token) {
                    return this.$store.dispatch('gui/setSettings', { discord: { token } });
                }
            },
            prefix: {
                get() {
                    return this.$store.state.gui.discord.prefix;
                },
                set(prefix) {
                    return this.$store.dispatch('gui/setSettings', { discord: { prefix } });
                }
            },
        },
        methods: {

        }
    }
</script>