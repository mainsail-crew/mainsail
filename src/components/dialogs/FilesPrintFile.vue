<style scoped>

</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_filamentRunout-subheader">
                    <v-icon small class="mr-2">mdi-printer-3d-nozzle-alert</v-icon>
                    <span>{{ name }}</span>
                    <v-spacer></v-spacer>
                    <small :class="'mr-3 ' + statusColor+'--text'">{{ statusText }}</small>
                    <v-icon @click="changeSensor">{{ enabled ? "mdi-toggle-switch" : "mdi-toggle-switch-off-outline" }}</v-icon>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>


<script lang="ts">
import {Component, Mixins, Prop} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import {FileStateFile} from "@/store/files/types";

@Component
export default class FilesPrintFile extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly item!: FileStateFile

}
</script>
