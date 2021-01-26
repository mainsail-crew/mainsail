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
                @click.native="showKeyboard"
                @blur="hideKeyboard"
                data-layout="normal"
            ></v-text-field>
            <v-switch v-model="toggleVirtualKeyboard" label="Virtual Keyboard" class="settings_dashboard_switch mt-0"></v-switch>
        </v-card-text>
    </v-card>
</template>

<script>
    import {bus} from "../../../main";
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
            toggleVirtualKeyboard: {
                get() {
                    return localStorage.virtualKeyboard=="enabled";
                },
                set(enable) {
                    if(enable)
                        localStorage.virtualKeyboard = "enabled"
                    else
                        localStorage.virtualKeyboard = "disabled"
                    bus.$emit("updatekeyboardstatus");
                    return localStorage.virtualKeyboard=="enabled";
                }
            },
        },
        methods: {
            showKeyboard:function(e){
                bus.$emit("showkeyboard",e);
            },
            hideKeyboard:function(){
                bus.$emit("hidekeyboard");
            }

        }
    }
</script>