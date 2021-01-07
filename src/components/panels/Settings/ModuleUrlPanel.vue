<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-puzzle</v-icon>Module URL´s</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <v-row>
                <v-col class="py-0 pb-3">
                    <v-text-field
                        v-model="scaleUrl"
                        hide-details
                        label="Scale URL"
                        @click.native="show"
                        @blur="hide"
                        data-layout="normal" 
                    ></v-text-field>
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
            scaleUrl: {
                get() {
                    return this.$store.state.gui.modules.scaleUrl;
                },
                set(scaleUrl) {
                    return this.$store.dispatch('gui/setSettings', { modules: { scaleUrl } });
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