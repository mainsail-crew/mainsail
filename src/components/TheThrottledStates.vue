<style scoped>

</style>

<template>
    <v-menu bottom left :offset-y="true" :close-on-content-click="false" v-model="showMenu" v-if="throttledStateFlags.length">
        <template v-slot:activator="{ on, attrs }">
            <v-btn :color="currentFlags.length ? 'error' : 'warning'" icon class="mr-3" v-bind="attrs" v-on="on">
                <v-icon>mdi-raspberry-pi</v-icon>
            </v-btn>
        </template>

        <v-list>
            <template v-if="currentFlags.length">
                <v-subheader class="" style="height: auto;">{{ $t("App.ThrottledStates.HeadlineCurrentFlags") }}</v-subheader>
                <v-list-item v-for="(flag) in currentFlags" :key="flag" style="min-height: auto;">
                    <v-list-item-content class="py-0">
                        <v-list-item-title>{{ flag }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="py-0 my-0">
                        <v-btn icon>
                            <v-icon color="grey lighten-1">mdi-information</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </template>
            <template v-if="previouslyFlags.length">
                <v-divider class="my-2" v-if="currentFlags.length"></v-divider>
                <v-subheader class="" style="height: auto;">{{ $t("App.ThrottledStates.HeadlinePreviouslyFlags") }}</v-subheader>
                <v-list-item v-for="(flag) in previouslyFlags" :key="flag" style="min-height: auto;">
                    <v-list-item-content class="py-0">
                        <v-list-item-title>{{ $t('App.ThrottledStates.Title'+convertName(flag)) }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="py-0 my-0">
                        <v-tooltip right>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon v-bind="attrs" v-on="on">
                                    <v-icon color="grey lighten-1">mdi-information</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('App.ThrottledStates.Tooltip'+convertName(flag)) }}</span>
                        </v-tooltip>
                    </v-list-item-action>
                </v-list-item>
            </template>
        </v-list>
    </v-menu>
</template>

<script lang="ts">


import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "./mixins/base";

@Component
export default class TheThrottledStates extends Mixins(BaseMixin) {
    private showMenu = false

    get throttledStateFlags() {
        /*return this.$store.state.server.throttled_state.flags.filter((flag) => {
            return  flag !== "?"
        })*/

        return [
            'Under-Voltage Detected',
            'Frequency Capped',
            'Currently Throttled',
            'Temperature Limit Active',
            'Previously Under-Volted',
            'Previously Frequency Capped',
            'Previously Throttled',
            'Previously Temperature Limited'
        ]
    }

    get currentFlags() {
        return this.throttledStateFlags.filter((flag) => {
            return !flag.startsWith("Previously ")
        })
    }

    get previouslyFlags() {
        return this.throttledStateFlags.filter((flag) => {
            return flag.startsWith("Previously ")
        })
    }

    convertName(flag: string): string {
        flag = flag.replaceAll(" ", "").replaceAll("-", "")
        flag = flag.charAt(0).toUpperCase() + flag.slice(1)

        return flag
    }
}
</script>
