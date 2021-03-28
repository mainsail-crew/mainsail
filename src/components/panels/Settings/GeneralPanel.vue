<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-cog</v-icon>{{ $t('Settings.GeneralPanel.General') }}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="printerName"
                            :label="$t('Settings.GeneralPanel.PrinterName')"
                            hide-details
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="currentLanguage"
                            :items="availableLanguages"
                            :label="$t('Settings.GeneralPanel.Language')"
                            hide-details
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="displayCancelPrint" hide-details class="mt-0">
                            <template v-slot:label>
                                {{ $t('Settings.GeneralPanel.DisplayCANCEL_PRINT') }}
                                <v-tooltip right>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-icon class="text--secondary ml-2" v-bind="attrs" v-on="on">mdi mdi-information</v-icon>
                                    </template>
                                    <span>{{ $t('Settings.GeneralPanel.ShowCANCEL_PRINT') }}</span>
                                </v-tooltip>
                            </template>
                        </v-switch>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="displayZOffsetStandby" hide-details class="mt-0">
                            <template v-slot:label>
                                {{ $t('Settings.GeneralPanel.DisplayZOffset') }}
                                <v-tooltip right>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-icon class="text--secondary ml-2" v-bind="attrs" v-on="on">mdi mdi-information</v-icon>
                                    </template>
                                    <span>{{ $t('Settings.GeneralPanel.ShowZOffset') }}</span>
                                </v-tooltip>
                            </template>
                        </v-switch>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="text-center">
                        <v-btn @click="dialogResetMainsail=true" >{{ $t('Settings.GeneralPanel.FactoryReset') }}</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialogResetMainsail" persistent :width="300">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-help-circle" left></v-icon> {{ $t('Settings.GeneralPanel.FactoryReset') }}
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialogResetMainsail = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3">
                    <v-container class="pb-0">

                        <v-row>
                            <v-col>
                                <p class="text-center mb-0">{{ $t('Settings.GeneralPanel.FactoryInfo') }}</p>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col class="text-center">
                                <v-btn
                                    color="red"
                                    @click="resetMainsail"
                                >
                                    {{ $t('Settings.GeneralPanel.ResetMainsail') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {
                dialogResetMainsail: false,
            }
        },
        computed: {
            printerName: {
                get() {
                    return this.$store.state.gui.general.printername
                },
                set(newName) {
                    return this.$store.dispatch('gui/setSettings', { general: { printername: newName } })
                }
            },
            currentLanguage: {
                get() {
                    return this.$store.state.gui.general.language;
                },
                set(newVal){
                    return this.$store.dispatch('gui/setSettings', { general: { language: newVal } });
                }
            },
            availableLanguages: {
                get() {
                    const locales = require.context('@/locales', true, /[A-Za-z0-9-_,\s]+\.js$/i)
                    const languages = []

                    locales.keys().map(key=>{
                        languages.push({
                            text: locales(key).default.title,
                            value: key.match(/([A-Za-z0-9-_]+)\./i)[1]
                        })
                    })

                    return languages
                }
            },
            displayCancelPrint: {
                get() {
                    return this.$store.state.gui.general.displayCancelPrint;
                },
                set(displayCancelPrint) {
                    return this.$store.dispatch('gui/setSettings', { general: { displayCancelPrint: displayCancelPrint } });
                }
            },
            displayZOffsetStandby: {
                get() {
                    return this.$store.state.gui.general.displayZOffsetStandby;
                },
                set(displayZOffsetStandby) {
                    return this.$store.dispatch('gui/setSettings', { general: { displayZOffsetStandby: displayZOffsetStandby } });
                }
            },
        },
        methods: {
            resetMainsail() {
                this.$store.dispatch('gui/resetMoonrakerDB')
                this.dialogResetMainsail = false
            }
        }
    }
</script>