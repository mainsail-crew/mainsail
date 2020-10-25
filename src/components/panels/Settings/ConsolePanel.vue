<style>
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-console-line</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Console</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pb-0 pt-3 content">
            <v-row>
                <v-col class="px-10 py-0">
                    <v-textarea
                        outlined
                        name="input-7-4"
                        label="Filters"
                        v-model="filters"
                        @blur="updateFilters($event)"
                    ></v-textarea>
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
            filters: {
                get() {
                    let c = this.$store.state.gui.console || {};
                    return (c.filters || []).join('\n');
                },
                set() {
                }
            },
        },
        methods: {
            updateFilters($event) {

                let inputValue = $event.currentTarget.value.trim();
                let filters = [...new Set(inputValue.split('\n'))];

                return this.$store.dispatch('setSettings', { gui: { console: { filters: filters } } });
            }
        }
    }
</script>
