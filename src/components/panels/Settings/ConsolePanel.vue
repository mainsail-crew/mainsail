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
                        validate-on-blur
                        :error-messages="filterErrors"
                        :error-count="filterErrors.length"
                        @blur="updateFilters($event)"
                    ></v-textarea>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

    function getFiltersFromText(text) {
        let inputValue = text.trim();
        let filters = [...new Set(inputValue.split('\n'))];
        return filters;
    }

    function getFilterErrors(filters) {

        let errors = [];
        filters.forEach(filter => {
            try { new RegExp(filter); }
            catch { errors.push(filter); }
        });

        if (errors.length) {
            errors.splice(0, 0, 'Invalid filters:');
        }

        return errors;
    }

    export default {
        components: {

        },
        data: function() {
            return {
                filterErrors: []
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
            }
        },
        methods: {
            updateFilters($event) {

                let filters = getFiltersFromText($event.currentTarget.value);
                this.filterErrors = getFilterErrors(filters);

                if (this.filterErrors.length === 0) {
                    this.$store.dispatch('setSettings', { gui: { console: { filters: filters } } });
                }
            }
        }
    }
</script>
