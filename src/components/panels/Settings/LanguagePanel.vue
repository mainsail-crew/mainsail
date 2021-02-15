<style>

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
            }
        }
    }
</script>