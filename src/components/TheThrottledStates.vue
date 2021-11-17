<style scoped>

</style>

<template>
    <v-menu bottom :offset-y="true" :close-on-content-click="false" v-model="showMenu" v-if="throttledStateFlags.length">
        <template v-slot:activator="{ on, attrs }">
            <v-btn :color="currentFlags.length ? 'error' : 'warning'" icon tile class="mr-3" v-bind="attrs" v-on="on">
                <v-icon>mdi-raspberry-pi</v-icon>
            </v-btn>
        </template>

        <v-list min-width="300" max-width="600">
            <template v-if="currentFlags.length">
                <v-subheader class="" style="height: auto;">{{ $t("App.ThrottledStates.HeadlineCurrentFlags") }}</v-subheader>
                <v-list-item v-for="(flag) in currentFlags" :key="flag" two-line>
                    <v-list-item-content class="py-0">
                        <v-list-item-title>{{ $t(`App.ThrottledStates.Title${convertName(flag)}`) }}</v-list-item-title>
                        <v-list-item-subtitle class="text-wrap">{{ $t(`App.ThrottledStates.Description${convertName(flag)}`) }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </template>
            <template v-if="previouslyFlags.length">
                <v-divider class="my-2" v-if="currentFlags.length"></v-divider>
                <v-subheader class="" style="height: auto;">{{ $t("App.ThrottledStates.HeadlinePreviouslyFlags") }}</v-subheader>
                <v-list-item v-for="(flag) in previouslyFlags" :key="flag" two-line>
                    <v-list-item-content class="py-0">
                        <v-list-item-title>{{ $t(`App.ThrottledStates.Title${convertName(flag)}`) }}</v-list-item-title>
                        <v-list-item-subtitle class="text-wrap">{{ $t(`App.ThrottledStates.Description${convertName(flag)}`) }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-list>
    </v-menu>
</template>

<script lang="ts">


import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from './mixins/base'

@Component
export default class TheThrottledStates extends Mixins(BaseMixin) {
    private showMenu = false

    get throttledStateFlags() {
        return this.$store.state.server.throttled_state.flags.filter((flag: string) => {
            return  flag !== '?'
        })

        /*return [
            'Under-Voltage Detected',
            'Frequency Capped',
            'Currently Throttled',
            'Temperature Limit Active',
            'Previously Under-Volted',
            'Previously Frequency Capped',
            'Previously Throttled',
            'Previously Temperature Limited'
        ]*/
    }

    get currentFlags() {
        return this.throttledStateFlags.filter((flag: string) => {
            return !flag.startsWith('Previously ')
        })
    }

    get previouslyFlags() {
        return this.throttledStateFlags.filter((flag: string) => {
            return flag.startsWith('Previously ')
        })
    }

    convertName(flag: string): string {
        flag = flag.replace(/ /g, '').replace(/-/g, '')
        flag = flag.charAt(0).toUpperCase() + flag.slice(1)

        return flag
    }
}
</script>
