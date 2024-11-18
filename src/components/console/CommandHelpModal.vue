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
                                :label="$t('Console.Search')"
                                outlined
                                hide-details
                                clearable
                                dense />
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-divider />
                <overlay-scrollbars class="command-help-content" :class="isMobile ? 'mobileHeight' : 'height300'">
                    <v-card-text class="pt-0">
                        <v-list>
                            <command-help-modal-entry
                                v-for="command of helplistFiltered"
                                :key="command"
                                :command="command"
                                @click-on-command="onCommand" />
                        </v-list>
                    </v-card-text>
                </overlay-scrollbars>
            </panel>
        </template>
    </v-dialog>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import Panel from '@/components/ui/Panel.vue'
import { mdiHelp, mdiCloseThick } from '@mdi/js'
import CommandHelpModalEntry from '@/components/console/CommandHelpModalEntry.vue'

@Component({
    components: { CommandHelpModalEntry, Panel },
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

    get helplist(): string[] {
        return Object.keys(this.$store.state.printer.gcode?.commands ?? {})
    }

    get helplistFiltered(): string[] {
        return this.helplist
            .filter((cmd) => cmd.includes(this.cmdListSearch.toUpperCase()))
            .sort((a, b) => a.localeCompare(b))
    }

    onCommand(gcode: string): void {
        this.$emit('onCommand', gcode)
        this.isOpen = false
    }

    @Watch('isOpen')
    onIsOpen(val: boolean): void {
        if (val) return

        this.cmdListSearch = ''
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
