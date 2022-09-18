<template>
    <v-tooltip right color="panel">
        <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on">
                {{ mdiHelpCircleOutline }}
            </v-icon>
        </template>
        <v-container class="version-container pa-0">
            <div><img height="12" src="/img/logo.svg" alt="mainsail-logo" /></div>
            <div>v{{ mainsailVersion }}</div>
            <div>
                <v-icon small class="moonraker-logo">{{ mdiMoonWaningCrescent }}</v-icon>
            </div>
            <div>{{ moonrakerVersion }}</div>
            <div><img height="12" src="/img/klipper.svg" class="klipper-logo" alt="klipper-logo" /></div>
            <div>{{ klipperVersion }}</div>
        </v-container>
    </v-tooltip>
</template>

<script lang="ts">
import BaseMixin from '../mixins/base'
import { Mixins } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { mdiCloseThick, mdiHelpCircleOutline, mdiMoonWaningCrescent } from '@mdi/js'

@Component({})
export default class AboutDialog extends Mixins(BaseMixin) {
    mdiHelpCircleOutline = mdiHelpCircleOutline
    mdiCloseThick = mdiCloseThick
    mdiMoonWaningCrescent = mdiMoonWaningCrescent

    get mainsailVersion(): string {
        return this.$store.state.packageVersion
    }

    get klipperVersion(): string {
        return this.$store.state.printer?.software_version ?? ''
    }

    get moonrakerVersion(): string {
        return this.$store.state.server?.moonraker_version ?? ''
    }
}
</script>

<style scoped>
.klipper-logo {
    transform: rotate(90deg);
}
.moonraker-logo {
    transform: rotate(45deg);
    color: #ebc815;
}
.version-container {
    display: grid;
    grid-template-columns: 20px auto;
}
</style>
