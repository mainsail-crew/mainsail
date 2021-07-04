<template>
    <v-dialog
        transition="dialog-bottom-transition"
        max-width="1600"
        scrollable
        v-model="isOpen"
    >
        <template #activator="{ on, attrs }">
            <v-btn
                class="gcode-command-btn px-2 minwidth-0"
                color="grey darken-3"
                :small="isMini"
                v-bind="attrs"
                v-on="on">
                <v-icon>mdi-help</v-icon>
            </v-btn>
        </template>
        <template #default>
            <v-card>
                <v-card-title class="d-flex align-center">
                    <span>Command list</span>
                    <v-text-field
                        v-model="cmdListSearch"
                        class="mx-4"
                        label="Search"
                    ></v-text-field>
                    <v-btn
                        class="gcode-command-btn px-2 minwidth-0"
                        @click="isOpen = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text style="height: 90vh">
                    <v-list>
                        <v-list-item
                            v-for="cmd of helplistFiltered"
                            :key="cmd.commandLow"
                            class="minHeight36"
                        >
                            <span
                                class="blue--text font-weight-bold mr-2 cursor-pointer"
                                @click="$emit('onCommand', cmd.command); isOpen = false">
                                {{ cmd.command }}:
                            </span>
                            <span>{{ cmd.description }}</span>
                        </v-list-item>
                    </v-list>
                </v-card-text>
<!--                <v-card-actions class="justify-end">
                    <v-btn
                        text
                        @click="dialog.value = false"
                    >
                        Schließen
                    </v-btn>
                </v-card-actions>-->
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts">
import BaseMixin from "./mixins/base";
import {CommandHelp} from "@/store/printer/types";
import {Mixins, Prop, Watch} from "vue-property-decorator";
import Component from "vue-class-component";

@Component
export default class CommandHelpModal extends Mixins(BaseMixin) {
    @Prop({ required: false, default: false }) isMini!: boolean;
    cmdListSearch = '';
    isOpen = false;

    get helplist(): CommandHelp[] {
        return this.$store.state.printer.helplist ?? []
    }

    get helplistFiltered(): CommandHelp[] {
        return this.helplist
            .filter(cmd => typeof(cmd.description) === "string" && (!this.cmdListSearch || cmd.commandLow.includes(this.cmdListSearch.toLowerCase())))
            .sort((a, b) => a.commandLow.localeCompare(b.commandLow));
    }

    @Watch('isOpen')
    onIsOpen(val: boolean): void {
        if (!val) {
            this.cmdListSearch = '';
        }
    }
}
</script>

<style scoped>

</style>
