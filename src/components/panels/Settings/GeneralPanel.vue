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
        <v-card-text>
            <v-row>
                <v-col class="py-0">
                    <v-text-field
                        v-model="printerName"
                        hide-details
                        label="Printer Name"
                        @click.native="show"
                        data-layout="normal" 
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="py-0">
                <v-col class="py-0" col-auto>
                    <v-switch v-model="virtualKeyboard" hide-details label="Virtual Keyboard"></v-switch>
                </v-col>
            </v-row>
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