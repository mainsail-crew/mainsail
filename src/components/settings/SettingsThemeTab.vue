<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.ThemeTab.Logo')">
                    <v-btn v-if="logoColor.toLowerCase() !== defaultLogoColor.toLowerCase()" small text class="minwidth-0" @click="logoColor = defaultLogoColor"><v-icon small>mdi-restart</v-icon></v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" :color="logoColor" class="minwidth-0 px-5" small></v-btn>
                        </template>
                        <v-color-picker
                            :value="logoColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateLogoColor"
                        ></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ThemeTab.Primary')">
                    <v-btn v-if="primaryColor.toLowerCase() !== defaultPrimaryColor.toLowerCase()" small text class="minwidth-0" @click="primaryColor = defaultPrimaryColor"><v-icon small>mdi-restart</v-icon></v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" :color="primaryColor" class="minwidth-0 px-5" small></v-btn>
                        </template>
                        <v-color-picker
                            :value="primaryColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updatePrimaryColor"
                        ></v-color-picker>
                    </v-menu>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from "@/components/settings/SettingsRow.vue";
import {defaultLogoColor, defaultPrimaryColor} from "@/store/variables";
import {Debounce} from "vue-debounce-decorator";
@Component({
    components: {SettingsRow}
})
export default class SettingsThemeTab extends Mixins(BaseMixin) {
    private defaultLogoColor = defaultLogoColor
    private defaultPrimaryColor = defaultPrimaryColor

    get logoColor() {
        return this.$store.state.gui.theme.logo
    }

    set logoColor(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'theme.logo', value: newVal})
    }

    get primaryColor() {
        return this.$store.state.gui.theme.primary
    }

    set primaryColor(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'theme.primary', value: newVal})
    }

    clearColorObject(color: any): string {
        if (typeof color === "object" && 'hex' in color)
            color = color.hex
        if (color.length > 7)
            color = color.substr(0, 7)
        return color
    }

    @Debounce(500)
    updateLogoColor(newVal: any) {
        this.logoColor = this.clearColorObject(newVal)
    }

    @Debounce(500)
    updatePrimaryColor(newVal: any) {
        this.primaryColor = this.clearColorObject(newVal)
    }
}
</script>