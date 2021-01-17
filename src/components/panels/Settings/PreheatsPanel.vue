
<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-fire</v-icon>Preheat Presets</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-3">
                <v-container>
                    <v-row v-for="(preset, index) in this['gui/getPreheatPresets']" v-bind:key="index">
                        <v-col class="rounded transition-swing secondary py-2 px-2 mb-6" style="cursor: pointer;">
                            <v-row align="center">
                                <v-col class="pl-6">
                                    <strong>{{ preset.name }}</strong>
                                </v-col>
                                <v-col>
                                    <span class="d-block text-no-wrap" v-for="[key, value] in Object.entries(preset.values)" v-bind:key="key">{{ key }}: {{ value }}°C</span>
                                </v-col>
                                <v-col class="col-auto"><v-btn small class="minwidth-0" v-on:click.stop.prevent="editPreset(preset)"><v-icon small>mdi-pencil</v-icon></v-btn></v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center mt-0">
                            <v-btn @click="createPreset">add preset</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialog.bool" persistent :width="300">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-fire" left></v-icon>
                        {{ dialog.index === null ? "Add" : "Edit" }} Preset
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialog.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3">
                    <v-container class="pb-0">
                        <v-form
                            v-model="dialog.valid"
                            @submit.prevent="savePreset"
                        >
                            <v-row>
                                <v-col class="col-12">
                                    <v-text-field
                                        v-model="dialog.name"
                                        label="Name"
                                        hide-details="auto"
                                        :rules="[rules.required, rules.unique]"
                                        dense
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="mt-2" v-for="(heater) of this['printer/getHeaters']" v-bind:key="heater.name">
                                <v-col class="col-12">
                                    <v-text-field
                                        v-model="dialog.values[heater.name]"
                                        :label="convertName(heater.name)"
                                        hide-details="auto"
                                        type="number"
                                        suffix="°C"
                                        dense
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="mt-2" v-for="(fan) of this['printer/getTemperatureFans']" v-bind:key="fan.name">
                                <v-col class="col-12">
                                    <v-text-field
                                        v-model="dialog.values[fan.name]"
                                        :label="convertName(fan.name)"
                                        hide-details
                                        type="number"
                                        suffix="°C"
                                        dense
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="mt-3">
                                <v-col class="text-center">
                                    <v-btn
                                        color="red"
                                        outlined
                                        class="float-left minwidth-0"
                                        @click="deletePreset"
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
                                        {{ dialog.index === null ? "Add" : "Edit" }} preset
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
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {

        },
        data: function() {
            return {
                dialog: {
                    bool: false,
                    valid: false,
                    name: "",
                    index: null,
                    values: {},
                },
                rules: {
                    required: (value) => value !== '' || 'required',
                    unique: (value) => !this.existsPresetName(value) || 'Name already exists',
                }
            }
        },
        computed: {
            ...mapState({
                orgState: state => state.gui.presets
            }),
            ...mapGetters([
                'printer/getHeaters',
                'printer/getTemperatureFans',
                'gui/getPreheatPresets',
            ])
        },
        methods: {
            convertName(name) {
                let output = ""
                name = name.replaceAll("_", " ")
                name.split(" ").forEach(split => {
                    output += " "+split.charAt(0).toUpperCase() + split.slice(1)
                })
                output = output.slice(1)

                return output;
            },
            existsPresetName(name) {
                return (this["gui/getPreheatPresets"].findIndex((preset) => preset.name === name && preset.index !== this.dialog.index) >= 0)
            },
            createPreset() {
                this.clearDialog()
                this.dialog.bool = true
            },
            clearDialog() {
                this.dialog.bool = false
                this.dialog.index = null
                this.dialog.name = ""
                this.dialog.values = {}
            },
            editPreset(preset) {
                this.dialog.name = preset.name
                this.dialog.index = preset.index
                this.dialog.values = {...preset.values}
                this.dialog.bool = true
            },
            savePreset() {
                if (this.dialog.valid) {
                    if (this.dialog.index) {
                        this.$store.dispatch('gui/updatePreset',  this.dialog )
                    } else this.$store.dispatch('gui/addPreset',  this.dialog )

                    this.clearDialog()
                }
            },
            deletePreset() {
                this.$store.dispatch('gui/deletePreset',  this.dialog )
                this.clearDialog()
            }
        }
    }
</script>