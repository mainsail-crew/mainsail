<style>

</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-translate</v-icon>{{ $t('Settings.LanguagePanel.Language') }}</span>
            </v-toolbar-title> 
        </v-toolbar>
        <v-card-text class="pt-2 pb-0">
            <v-select
            v-model="lang"
            @change="changeLanguage"
          :items="Languages"
          :label="$t('Settings.LanguagePanel.Language')"
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
                Languages: []
            }
        },
        computed: {
            lang: {
                get() {
                    return this.$store.state.gui.general.language;
                },
                set(newVal){
                    return this.$store.dispatch('gui/setSettings', { general: { language: newVal } });
                }
            }
        },
        methods: {
            changeLanguage(val){
                this.lang = val
            },
            getLanguages(){
                const locales = require.context('@/locales', true, /[A-Za-z0-9-_,\s]+\.js$/i)
                this.Languages = []
                locales.keys().map(key=>{
                    this.Languages.push({
                        text: locales(key).default.title,
                        value: key.match(/([A-Za-z0-9-_]+)\./i)[1]
                    })
                })
            }
        },
        created(){
            this.getLanguages();
        }
    }
</script>