<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-led-off</v-icon>Neopixel</span>
                <span class="subheading" v-if="!centerAviable" style="color:#D32F2F;">  Module not found!</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <v-row>
                <v-col class="py-0">
                    <v-text-field
                        v-model="numbleds"
                        hide-details
                        label="Led Amount"
                        @click.native="show"
                        @blur="hide"
                        data-layout="numeric" 
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-color-picker
                        dot-size="25"
                        hide-mode-switch
                        hide-inputs
                        v-model="color"
                    ></v-color-picker>
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
            centerAviable: {
                get() {
                    return this.$store.state.gui.dashboard.boolNeopixelCenterAvailable;
                }
            },
            numbleds: {
                get() {
                    return this.$store.state.gui.neopixelcenter.numbleds;
                },
                set(numbleds) {
                    return this.$store.dispatch('gui/setSettings', { neopixelcenter: { numbleds } });
                }
            },
            color: {
                get() {
                    return this.$store.state.gui.neopixelcenter.color;
                },
                set(color) {
                    console.log(this.hexAToRGBA(color))
                    return this.$store.dispatch('gui/setSettings', { neopixelcenter: { color } });
                }
            },
        },
        methods: {
            hexAToRGBA:function(h) {
                let r = 0, g = 0, b = 0, a = 1;

                if (h.length == 5) {
                    r = "0x" + h[1] + h[1];
                    g = "0x" + h[2] + h[2];
                    b = "0x" + h[3] + h[3];
                    a = "0x" + h[4] + h[4];

                } else if (h.length == 9) {
                    r = "0x" + h[1] + h[2];
                    g = "0x" + h[3] + h[4];
                    b = "0x" + h[5] + h[6];
                    a = "0x" + h[7] + h[8];
                }
                a = +(a / 255)
                a = a*100
                a = a.toFixed(0);

                return "rgba(" + +r + "," + +g + "," + +b + "," + a + ")";
            },
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            }
        }
    }
</script>