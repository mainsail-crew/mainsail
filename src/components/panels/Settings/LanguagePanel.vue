<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-translate</v-icon>{{ $t('Setting.Language') }}</span>
            </v-toolbar-title> 
        </v-toolbar>
        <v-card-text class="pt-2 pb-0">
            <v-select
            v-model="lang"
            @change="changeLanguage"
          :items="items"
          :label="$t('Setting.Language')"
        ></v-select>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {
                items: [
                    {
                        text: "English",
                        value: "en"
                    },
                    {
                        text: "简体中文",
                        value: "zh"
                    }
                ]
            }
        },
        computed: {
            lang: {
                get() {
                    return localStorage.getItem("lang")
                },
                set(newName){
                    return localStorage.setItem("lang",newName)
                }
            },
            printerName: {
                get() {
                    return this.$store.state.gui.general.printername;
                },
                set(newName) {
                    return this.$store.dispatch('gui/setSettings', { general: { printername: newName } });
                }
            },
        },
        methods: {
            changeLanguage(val){
                this.$i18n.locale = this.lang = val
            }
        }
    }
</script>