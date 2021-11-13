<style scoped>
    .klipper-logo {
        transform: rotate(90deg);
    }
    .moonraker-logo {
        transform: rotate(45deg);
        color: #EBC815;
    }
    .version-container {
        display: grid;
        grid-template-columns: 20px auto;

    }
</style>

<template>
    <v-dialog
        transition="dialog-bottom-transition"
        max-width="600"
        scrollable
        v-model="isOpen"
    >
        <template v-slot:activator="{ an }">
            <v-tooltip right color="panel">
                <template v-slot:activator="{ on, attrs }">
                    <!-- <v-icon v-bind="attrs" @mouseenter="on.mouseenter" @mouseleave="on.mouseleave" @click.stop="isOpen = true">mdi-help-circle-outline</v-icon> -->
                    <v-icon v-on="an" v-bind="attrs" @mouseenter="on.mouseenter" @mouseleave="on.mouseleave">mdi-help-circle-outline</v-icon>
                </template>
                <span class="dark version-container">
                    <div><img height="12" src="/img/logo.svg"></div>
                    <div>v{{ mainsailVersion }}</div>
                    <div><v-icon small class="moonraker-logo">mdi-moon-waning-crescent</v-icon></div>
                    <div>{{ moonrakerVersion }}</div>
                    <div><img height="12" src="/img/klipper.svg" class="klipper-logo"></div>
                    <div>{{ klipperVersion }}</div>
                </span>
            </v-tooltip>
        </template>
        <template v-slot:default>
            <panel title="About" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="isOpen = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-container fliud class="align-self-start">
                        <v-row tag="logo">
                            <v-col cols="auto">
                                <v-img height="80" contain src="https://docs.mainsail.xyz/assets/img/logo-mainsail.png"></v-img>
                            </v-col>
                        </v-row>
                        <v-row tag="data1" justify="center">
                            <v-col class="pr-3 text-right">Version</v-col>
                            <v-col>v2.1.0-alpha</v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </panel>
        </template>
    </v-dialog>
</template>

<script lang="ts">
import BaseMixin from '../mixins/base'
import {Mixins} from 'vue-property-decorator'
import Component from 'vue-class-component'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {Panel}
})
export default class AboutModal extends Mixins(BaseMixin) {
    private isOpen = false;

    get mainsailVersion(): string {
        return this.$store.state.packageVersion
    }

    get klipperVersion():string {
        return this.$store.state.printer?.software_version ?? ''
    }

    get moonrakerVersion():string {
        return this.$store.state.server?.moonraker_version ?? ''
    }
}
</script>