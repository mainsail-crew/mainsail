<template>
    <div>
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
                <v-row>
                    <v-col class="text-center mt-0">
                        <v-btn @click="dialogResetMainsail=true" >reset mainsail</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialogResetMainsail" persistent :width="300">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-help-circle" left></v-icon> Reset Mainsail
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialogResetMainsail = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3">
                    <v-container class="pb-0">

                        <v-row>
                            <v-col>
                                <p class="text-center mb-0">Do you really want to reset mainsail to factory settings?</p>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col class="text-center">
                                <v-btn
                                    color="red"
                                    @click="resetMainsail"
                                >
                                    reset mainsail
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
        },
        methods: {
            resetMainsail() {
                this.$store.dispatch('gui/resetMoonrakerDB')
                this.dialogResetMainsail = false
            }
        }
    }
</script>