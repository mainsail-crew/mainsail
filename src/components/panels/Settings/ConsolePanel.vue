<style>

</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-console-line</v-icon>{{ $t('Settings.ConsolePanel.Console') }}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-3">
                <v-container>
                    <v-row>
                        <v-col class="rounded transition-swing secondary py-2 px-2 mb-3" style="cursor: pointer;">
                            <v-row align="center">
                                <v-col class="pl-4">
                                    <v-switch v-model="hideWaitTemperatures" :label="$t('Settings.ConsolePanel.HideTemperatures')" hide-details class="mt-0"></v-switch>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row v-for="(filter, index) in this['gui/getConsoleFilters']" v-bind:key="index">
                        <v-col class="rounded transition-swing secondary py-2 px-2 mb-3" style="cursor: pointer;">
                            <v-row align="center">
                                <v-col class="pl-4">
                                    <v-switch v-model="filter.bool" @change="toggleFilter(filter)" :label="filter.name" hide-details class="mt-0"></v-switch>
                                </v-col>
                                <v-col class="col-auto text-right"><v-btn small class="minwidth-0 float-right" v-on:click.stop.prevent="editFilter(filter)"><v-icon small>mdi-pencil</v-icon></v-btn></v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center mt-0">
                            <v-btn @click="createFilter">{{ $t('Settings.ConsolePanel.AddFilter')}}</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialog.bool" persistent :width="400">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-fire" left></v-icon>
                        {{ dialog.index === null ? $t('Settings.ConsolePanel.CreateHeadline') : $t('Settings.ConsolePanel.EditHeadline') }}
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialog.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3">
                    <v-container class="pb-0">
                        <v-form
                            v-model="dialog.valid"
                            @submit.prevent="saveFilter"
                        >
                            <v-row>
                                <v-col>
                                    <v-row>
                                        <v-col class="col-12">
                                            <v-text-field
                                                v-model="dialog.name"
                                                :label="$t('Settings.ConsolePanel.Name')"
                                                hide-details="auto"
                                                :rules="[rules.required, rules.unique]"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-textarea
                                        outlined
                                        name="input-7-4"
                                        :label="$t('Settings.ConsolePanel.Regex')"
                                        v-model="dialog.regex"
                                        hide-details="auto"
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                            <v-row class="mt-3">
                                <v-col class="text-center">
                                    <v-btn
                                        color="red"
                                        outlined
                                        class="float-left minwidth-0"
                                        @click="deleteFilter"
                                        v-if="this.dialog.index !== null"
                                    >
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                    <v-btn
                                        color="white"
                                        outlined
                                        :class="dialog.index !== null ? 'float-right' : '' "
                                        type="submit"
                                    >
                                        {{ dialog.index === null ? $t('Settings.ConsolePanel.StoreButton') : $t('Settings.ConsolePanel.UpdateButton') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        components: {

        },
        data: function() {
            return {
                dialog: {
                    bool: false,
                    valid: false,
                    name: "",
                    regex: "",
                    index: null,
                },
                rules: {
                    required: (value) => value !== '' || 'required',
                    unique: (value) => !this.existsPresetName(value) || 'Name already exists',
                },
            }
        },
        computed: {
            ...mapGetters([
                'gui/getConsoleFilters',
            ]),
            hideWaitTemperatures: {
                get() {
                    return this.$store.state.gui.console.hideWaitTemperatures;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { console: { hideWaitTemperatures: status } });
                }
            }
        },
        methods: {
            existsPresetName(name) {
                return (this["gui/getConsoleFilters"].findIndex((filter) => filter.name === name && filter.index !== this.dialog.index) >= 0)
            },
            clearDialog() {
                this.dialog.bool = false
                this.dialog.index = null
                this.dialog.name = ""
                this.dialog.regex = ""
            },
            createFilter() {
                this.clearDialog()
                this.dialog.bool = true
            },
            editFilter(preset) {
                this.dialog.name = preset.name
                this.dialog.index = preset.index
                this.dialog.regex = preset.regex

                this.dialog.bool = true
            },
            saveFilter() {
                if (this.dialog.valid) {
                    if (this.dialog.index) {
                        this.$store.dispatch('gui/updateConsoleFilter',  this.dialog)
                    } else this.$store.dispatch('gui/addConsoleFilter',  this.dialog)

                    this.clearDialog()
                }
            },
            toggleFilter(filter) {
                this.$store.dispatch('gui/updateConsoleFilter',  filter)
            },
            deleteFilter() {
                this.$store.dispatch('gui/deleteConsoleFilter',  this.dialog)
                this.clearDialog()
            },
        }
    }
</script>