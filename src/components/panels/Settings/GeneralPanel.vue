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
        <v-card-text class="py-0">
            <v-text-field
                v-model="printerName"
                label="Printer Name"
                @click.native="show"
                @blur="hide"
                data-layout="normal"
            ></v-text-field>
            <v-switch v-model="virtualKeyboard" label="Virtual Keyboard" class="settings_dashboard_switch mt-0"></v-switch>
        </v-card-text>
        
    </v-card>
</template>

<script>
    import {bus} from "../../../main";
    
    export default {
        components: {

        },
        data: () => ({

        }),
        computed: {
            printerName: {
                get() {
                    return this.$store.state.gui.general.printername;
                },
                set(newName) {
                    return this.$store.dispatch('gui/setSettings', { general: { printername: newName } });
                }
            },
            virtualKeyboard: {
                get() {
                    return this.$cookies.isKey("enableVirtualKeyboard");
                },
                set(newStatus) {
                    var cookieValue
                    if(newStatus==false){
                        cookieValue = this.$cookies.remove('enableVirtualKeyboard')
                        bus.$emit("updatekeyboardcookie");
                        return cookieValue;
                    }
                    cookieValue = this.$cookies.set('enableVirtualKeyboard','default');
                    bus.$emit("updatekeyboardcookie");
                    return cookieValue;
                }
            },
        },
        methods: {
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            }
        }
    }
</script>