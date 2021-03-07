
<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-code-tags</v-icon>Macros</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="py-3">
            <v-container px-0 py-0>
                <v-row v-for="(macro, index) in this['printer/getAllMacros']" v-bind:key="index">
                    <v-col class="py-2">
                        <settings-macro-switch :name="macro.name"></settings-macro-switch>
                    </v-col>
                </v-row>
                <v-row v-if="this['printer/getAllMacros'].length === 0">
                    <v-col>
                        <p class="mb-0 text-center font-italic">No macros found...</p>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import SettingsMacroSwitch from "../../../inputs/SettingsMacroSwitch";

    export default {
        components: {
            SettingsMacroSwitch
        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                hiddenMacros: state => state.gui.dashboard.hiddenMacros,
            }),
            ...mapGetters([
                'printer/getAllMacros',
            ])
        },
        methods: {

        }
    }
</script>