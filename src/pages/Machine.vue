<template>
    <v-container fluid py-0 px-0>
        <v-row>
            <v-col class="col-12 col-sm-6">
<!--                <settings-config-files-panel></settings-config-files-panel>-->
            </v-col>
            <v-col class="col-12 col-sm-6">
                <klippy-state-panel></klippy-state-panel>
                <limits-panel></limits-panel>
                <update-panel></update-panel>
                <v-row class="mt-6">
                    <v-col class="col-md-6" v-if="klippy_state === 'ready'">
<!--                        <settings-endstop-panel></settings-endstop-panel>-->
                    </v-col>
                    <v-col :class="(klippy_state !== 'ready' ? 'col-md-12' : 'col-md-6')">
<!--                        <settings-logfiles-panel></settings-logfiles-panel>-->
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import KlippyStatePanel from "@/components/panels/KlippyStatePanel.vue";
import LimitsPanel from "@/components/panels/Maschine/LimitsPanel.vue";
import UpdatePanel from "@/components/panels/Maschine/UpdatePanel.vue";
@Component({
    components: {UpdatePanel, LimitsPanel, KlippyStatePanel}
})
export default class PageMachine extends Mixins(BaseMixin) {

}

/*    import {mapState} from "vuex";

    export default {
        name: "settingsMachine",
        data: () => ({

        }),
        computed: {
            ...mapState({
                klippy_state: state => state.server.klippy_state,
            }),
            updateManager:{
                get() {
                    //reverse compatibility
                    if ('plugins' in this.$store.state.server)
                        return this.$store.state.server.plugins.includes('update_manager')

                    return this.$store.state.server.components.includes('update_manager')
                }
            }
        },
        created() {

        },
        watch: {

        }
    }*/
</script>