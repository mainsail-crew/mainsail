<template>
    <v-dialog v-model="showDialog" width="500" persistent :fullscreen="isMobile">
        <panel
            id="devices-dialog"
            :title="$t('DevicesDialog.Headline')"
            :icon="mdiUsb"
            card-class="devices-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-menu location="bottom end" :close-on-content-click="false" attach="#devices-dialog">
                    <template #activator="{ props: activatorProps }">
 <v-btn :icon="mdiCog" rounded="0" v-bind="activatorProps"/>
                    </template>
                    <v-list>
                        <v-list-item class="minHeight36">
                            <v-checkbox
                                v-model="hideSystemEntries"
                                class="mt-0"
                                hide-details
                                :label="$t('DevicesDialog.HideSystemEntries')" />
                        </v-list-item>
                    </v-list>
                </v-menu>
 <v-btn :icon="mdiCloseThick" rounded="0" @click="closePrompt"/>
            </template>
            <v-tabs v-model="currentTab" fixed-tabs>
                <v-tab v-for="t in tabs" :key="t.tab" :value="t.tab">{{ t.title }}</v-tab>
            </v-tabs>
            <OverlayScrollbarsComponent style="max-height: 400px; overflow-x: hidden">
                <v-window v-model="currentTab">
                    <v-window-item v-for="canInterface in canInterfaces" :key="canInterface" :value="canInterface">
                        <devices-dialog-can :hide-system-entries="hideSystemEntries" :name="canInterface" />
                    </v-window-item>
                    <v-window-item value="serial">
                        <devices-dialog-serial :hide-system-entries="hideSystemEntries" />
                    </v-window-item>
                    <v-window-item value="usb">
                        <devices-dialog-usb :hide-system-entries="hideSystemEntries" />
                    </v-window-item>
                    <v-window-item value="video">
                        <devices-dialog-video :hide-system-entries="hideSystemEntries" />
                    </v-window-item>
                </v-window>
            </OverlayScrollbarsComponent>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { mdiCog, mdiCloseThick, mdiUsb } from '@mdi/js'

const store = useStore()
const { isMobile } = useBase()

const currentTab = ref('serial')
const hideSystemEntries = ref(true)

const props = defineProps({
    modelValue: { type: Boolean },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const tabs = computed(() => {
    const output: { tab: string; title: string }[] = [
        {
            tab: 'serial',
            title: 'Serial',
        },
        {
            tab: 'usb',
            title: 'USB',
        },
        {
            tab: 'video',
            title: 'Video',
        },
    ]

    canInterfaces.value.forEach((name) => {
        output.push({
            tab: name,
            title: name.toUpperCase(),
        })
    })

    return output.sort((a, b) => a.title.localeCompare(b.title))
})

const canInterfaces = computed(() => Object.keys(store.state.server.system_info?.canbus ?? {}))

function closePrompt() {
    showDialog.value = false
}
</script>

<style scoped></style>
