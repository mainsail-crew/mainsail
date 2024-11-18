<template>
    <panel
        v-if="socketIsConnected && klipperState !== 'disconnected'"
        :icon="mdiConsoleLine"
        :title="$t('Panels.MiniconsolePanel.Headline')"
        :collapsible="true"
        card-class="miniconsole-panel"
        :hide-buttons-on-collapse="true">
        <template #buttons>
            <v-btn icon tile @click="clearConsole">
                <v-icon small>{{ mdiTrashCan }}</v-icon>
            </v-btn>
            <command-help-modal :in-toolbar="true" @onCommand="commandClick($event)" />
            <v-menu
                :offset-y="true"
                :close-on-content-click="false"
                :title="$t('Panels.MiniconsolePanel.SetupConsole')">
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon small>{{ mdiCog }}</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-if="consoleDirection === 'shell'" class="minHeight36">
                        <v-checkbox
                            v-model="autoscroll"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.Autoscroll')" />
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox
                            v-model="hideWaitTemperatures"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTemperatures')" />
                    </v-list-item>
                    <v-list-item v-if="moonrakerComponents.includes('timelapse')" class="minHeight36">
                        <v-checkbox
                            v-model="hideTlCommands"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTimelapse')" />
                    </v-list-item>
                    <v-list-item v-for="(filter, index) in customFilters" :key="index" class="minHeight36">
                        <v-checkbox
                            v-model="filter.bool"
                            class="mt-0"
                            hide-details
                            :label="filter.name"
                            @change="toggleFilter(index, filter)" />
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox
                            v-model="rawOutput"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.RawOutput')" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <div class="d-flex flex-column">
            <v-card-text :class="consoleDirection === 'table' ? 'order-1' : 'order-2'">
                <console-textarea ref="gcodeCommandField" />
            </v-card-text>
            <v-card-text :class="(consoleDirection === 'table' ? 'order-2' : 'order-1') + ' pa-0'">
                <v-row>
                    <v-col>
                        <overlay-scrollbars
                            ref="miniConsoleScroll"
                            :style="'height: ' + consoleHeight + 'px;'"
                            :options="{}">
                            <console-table
                                ref="console"
                                :events="events"
                                :is-mini="true"
                                @command-click="commandClick" />
                            <v-divider />
                        </overlay-scrollbars>
                    </v-col>
                </v-row>
            </v-card-text>
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCog, mdiConsoleLine, mdiTrashCan } from '@mdi/js'
import CommandHelpModal from '@/components/console/CommandHelpModal.vue'
import ConsoleMixin from '@/components/mixins/console'
import ConsoleTextarea from '@/components/inputs/ConsoleTextarea.vue'

@Component({
    components: {
        Panel,
        ConsoleTable,
        CommandHelpModal,
    },
})
export default class MiniconsolePanel extends Mixins(BaseMixin, ConsoleMixin) {
    mdiTrashCan = mdiTrashCan
    mdiConsoleLine = mdiConsoleLine
    mdiCog = mdiCog

    @Ref() readonly miniConsoleScroll!: any
    @Ref() readonly gcodeCommandField!: typeof ConsoleTextarea

    get consoleHeight() {
        return this.$store.state.gui.console.height ?? 300
    }

    get events() {
        return this.$store.getters['server/getConsoleEvents'](this.consoleDirection === 'table', 250)
    }

    @Watch('events')
    eventsChanged() {
        if (this.consoleDirection === 'shell' && this.autoscroll) {
            setTimeout(() => {
                this.scrollToBottom()
            }, 50)
        }
    }

    @Watch('autoscroll')
    autoscrollChanged(newVal: boolean) {
        if (newVal) this.scrollToBottom()
    }

    commandClick(msg: string): void {
        this.gcodeCommandField.setGcode(msg)
    }

    mounted() {
        if (this.consoleDirection === 'shell') this.scrollToBottom()
    }

    scrollToBottom() {
        this.$nextTick(() => {
            this.scrollTo(100)
        })
    }

    scrollToTop() {
        this.$nextTick(() => {
            this.scrollTo(0)
        })
    }

    scrollTo(position: number) {
        if (!this.miniConsoleScroll) return

        const instance = this.miniConsoleScroll.osInstance()
        instance?.scroll({ y: `${position}%` })
    }
}
</script>

<style scoped>
.consoleTable {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

html.theme--light .consoleTable {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
