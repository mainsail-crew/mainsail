
<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-code-tags</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Macros</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pb-3 pt-3 content">
            <div v-for="(macro, index) in getAllMacros" v-bind:key="index">
                <v-row>
                    <v-col class="px-10 py-0">
                        <settings-macro-switch :name="macro.name"></settings-macro-switch>
                    </v-col>
                </v-row>
            </div>
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
                'getAllMacros',
            ])
        },
        methods: {

        }
    }
</script>