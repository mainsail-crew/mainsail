<template>
    <v-dialog v-model="isOpen" transition="dialog-bottom-transition" max-width="600" :fullscreen="isMobile">
        <template #activator="{ on, attrs }">
            <template v-if="inToolbar">
                <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon small>{{ mdiHelp }}</v-icon>
                </v-btn>
            </template>
            <template v-else>
                <v-btn
                    class="gcode-command-btn px-2 minwidth-0"
                    color="lightgray"
                    :small="isMini"
                    v-bind="attrs"
                    v-on="on">
                    <v-icon>{{ mdiHelp }}</v-icon>
                </v-btn>
            </template>
        </template>
        <template #default>
            <panel
                :title="$t('Console.CommandList')"
                :icon="mdiHelp"
                card-class="command-help-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="isOpen = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-title>
                    <v-row>
                        <v-col>
                            <v-text-field
                                v-model="cmdListSearch"
                                label="Search"
                                outlined
                                hide-details
                                clearable
                                dense></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-divider></v-divider>
                <overlay-scrollbars class="command-help-content" :class="isMobile ? 'mobileHeight' : 'height300'">
                    <v-card-text class="pt-0">
                        <v-row>
                            <v-col>
                                <v-list>
                                    <v-list-item
                                        v-for="cmd of helplistFiltered"
                                        :key="cmd.commandLow"
                                        class="px-0"
                                        two-line>
                                        <v-list-item-content class="px-0">
                                            <v-list-item-title
                                                class="primary--text font-weight-bold cursor-pointer"
                                                @click="
                                                    $emit('onCommand', cmd.command)
                                                    isOpen = false
                                                ">
                                                {{ cmd.command }}
                                            </v-list-item-title>
                                            <v-list-item-subtitle class="text-wrap">
                                                {{ cmd.description }}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </overlay-scrollbars>
            </panel>
        </template>
    </v-dialog>
</template>

<script lang="ts">
import BaseMixin from './mixins/base'
import { CommandHelp } from '@/store/printer/types'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import Panel from '@/components/ui/Panel.vue'
import { mdiHelp, mdiCloseThick } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class CommandHelpModal extends Mixins(BaseMixin) {
    @Prop({ required: false, default: false }) declare isMini: boolean
    @Prop({ required: false, default: false }) declare inToolbar: boolean

    cmdListSearch = ''
    isOpen = false

    /**
     * Icons
     */

    mdiHelp = mdiHelp
    mdiCloseThick = mdiCloseThick

    get helplist(): CommandHelp[] {
        return this.$store.state.printer.helplist ?? []
    }

    get helplistFiltered(): CommandHelp[] {
        return this.helplist
            .filter(
                (cmd) =>
                    typeof cmd.description === 'string' &&
                    (!this.cmdListSearch || cmd.commandLow.includes(this.cmdListSearch.toLowerCase()))
            )
            .sort((a, b) => a.commandLow.localeCompare(b.commandLow))
    }

    @Watch('isOpen')
    onIsOpen(val: boolean): void {
        if (!val) {
            this.cmdListSearch = ''
        }
    }
}
</script>

<style scoped>
.command-help-content {
    overflow-x: hidden;

    &.height300 {
        height: 300px;
    }

    &.mobileHeight {
        height: calc(var(--app-height) - 48px - 73px);
    }
}
</style>
