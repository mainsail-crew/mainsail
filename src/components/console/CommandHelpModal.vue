<template>
    <v-dialog v-model="isOpen" transition="dialog-bottom-transition" max-width="600" :fullscreen="isMobile">
        <template #activator="{ props }">
            <v-btn v-if="inToolbar" icon tile v-bind="props">
                <v-icon small>{{ mdiHelp }}</v-icon>
            </v-btn>
            <v-btn
                v-else
                class="gcode-command-btn px-2 minwidth-0"
                color="lightgray"
                :small="isMini"
                v-bind="props">
                <v-icon>{{ mdiHelp }}</v-icon>
            </v-btn>
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { mdiHelp, mdiCloseThick } from '@mdi/js'
import CommandHelpModalEntry from '@/components/console/CommandHelpModalEntry.vue'

const props = defineProps<{
    isMini?: boolean
    inToolbar?: boolean
}>()

const emit = defineEmits<{
    (e: 'onCommand', gcode: string): void
}>()

const store = useStore()
const { isMobile } = useBase()

const cmdListSearch = ref('')
const isOpen = ref(false)

const helplist = computed<string[]>(() => Object.keys(store.state.printer.gcode?.commands ?? {}))

const helplistFiltered = computed<string[]>(() =>
    helplist.value
        .filter((cmd) => cmd.includes(cmdListSearch.value.toUpperCase()))
        .sort((a, b) => a.localeCompare(b))
)

function onCommand(gcode: string): void {
    emit('onCommand', gcode)
    isOpen.value = false
}

watch(isOpen, (val: boolean) => {
    if (val) return

    cmdListSearch.value = ''
})
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
