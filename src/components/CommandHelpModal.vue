<template>
    <v-dialog
        transition="dialog-bottom-transition"
        max-width="1600"
    >
        <template #activator="{ on, attrs }">
            <v-btn class="mr-2 gcode-command-btn px-2 minwidth-0"
                   v-bind="attrs"
                   v-on="on">
                <v-icon>mdi-help</v-icon>
            </v-btn>
        </template>
        <template #default="dialog">
            <v-card>
                <v-card-title>
                    Command list
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="cmdListSearch" class="mx-4" label="Search" autofocus></v-text-field>
                    <v-list>
                        <v-list-item
                            v-for="cmd of helplistFiltered"
                            :key="cmd.commandLow"
                            class="minHeight36"
                        >
                            <span
                                class="blue--text font-weight-bold mr-2 cursor-pointer"
                                @click="$emit('onCommand', cmd.command); dialog.value = false">
                                {{ cmd.command }}:
                            </span>
                            <span>{{ cmd.description }}</span>
                        </v-list-item>
                    </v-list>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn
                        text
                        @click="dialog.value = false"
                    >
                        Schließen
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts">
import {Mixins} from "vue-property-decorator";
import BaseMixin from "./mixins/base";
import {CommandHelp} from "@/store/printer/types";

export default class CommandHelpModal extends Mixins(BaseMixin) {
    public cmdListSearch: string | null = null;

    get helplist(): CommandHelp[] {
        return this.$store.state.printer.helplist ?? []
    }

    get helplistFiltered(): CommandHelp[] {
        return this.helplist
            .filter(cmd => typeof(cmd.description) === "string" && (!this.cmdListSearch || cmd.commandLow.includes(this.cmdListSearch.toLowerCase())))
            .sort((a, b) => a.commandLow.localeCompare(b.commandLow));
    }

}
</script>

<style scoped>

</style>
