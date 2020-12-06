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
                        focus="show"
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
    export default {
        components: {

        },
        data: () => ({
            visible: false,
            layout: "normal",
            input: null,
            options: {
                useKbEvents: false,
                preventClickEvent: false
            }
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
                    if(newStatus==false){
                        return this.$cookies.remove('enableVirtualKeyboard');
                    }
                    return this.$cookies.set('enableVirtualKeyboard','default');
                }
            },
        },
        methods: {
            accept(text) {
                alert("Input text: " + text);
                this.hide();
            },

            show(e) {
                this.input = e.target;
                this.layout = e.target.dataset.layout;

            if (!this.visible)
                this.visible = true
            },

            hide() {
            this.visible = false;
            },
        }
    }
</script>