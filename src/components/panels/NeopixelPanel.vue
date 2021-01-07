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
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-0">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-center">
                    <v-color-picker
                                dot-size="25"
                                hide-mode-switch
                                hide-inputs
                                v-model="color"
                            ></v-color-picker>
                </v-flex>
                <v-flex col class="text-center neopixel-swatchesonly">
                    <v-color-picker
                                dot-size="25"
                                hide-canvas
                                hide-inputs
                                hide-mode-switch
                                show-swatches
                                swatches-max-height="240"
                                v-model="color"
                            ></v-color-picker>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import {bus} from "../../main";
    
    export default {
        components: {

        },
        data: () => ({

        }),
        computed: {
            color: {
                get() {
                    return this.$store.state.gui.neopixelcenter.color;
                },
                set(color) {
                    var ledcolor = this.hexAToRGBA(color);
                    this.executeNeopixel(ledcolor);
                    return this.$store.dispatch('gui/setSettings', { neopixelcenter: { color } });
                }
            },
        },
        methods: {
            executeNeopixel:function(color){
                this.$socket.sendObj('printer.gcode.script', { script: 'SET_LED LED='+this.$store.state.gui.neopixelcenter.stripname+' RED='+color[0]+' GREEN='+color[1]+' BLUE='+color[2] });
            },
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
                a = a.toFixed(2);
                
                r = +(r / 255)
                r = r*a;
                r = r.toFixed(2);
                g = +(g / 255)
                g = g*a;
                g = g.toFixed(2);
                b = +(b / 255)
                b = b*a;
                b = b.toFixed(2);
                var ledcolor = [+r,+g,+b]

                return ledcolor;
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