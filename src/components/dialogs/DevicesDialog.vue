<template>
    <v-dialog :value="showDialog" width="500" persistent :fullscreen="isMobile">
        <panel
            id="devices-dialog"
            :title="$t('DevicesDialog.Headline')"
            :icon="mdiUsb"
            card-class="devices-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-menu :left="true" :offset-y="true" :close-on-content-click="false" attach="#devices-dialog">
                    <template #activator="{ on, attrs }">
                        <v-btn icon tile v-bind="attrs" v-on="on">
                            <v-icon small>{{ mdiCog }}</v-icon>
                        </v-btn>
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
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-tabs v-model="tab" fixed-tabs>
                <v-tab v-for="tab in tabs" :key="tab.name">{{ tab.content }}</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item key="usb">
                    <devices-dialog-usb :hide-system-entries="hideSystemEntries" />
                </v-tab-item>
                <v-tab-item key="serial">
                    <devices-dialog-serial :hide-system-entries="hideSystemEntries" />
                </v-tab-item>
                <v-tab-item key="can">can</v-tab-item>
                <v-tab-item key="video">video</v-tab-item>
            </v-tabs-items>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCog, mdiCloseThick, mdiUsb } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class DevicesDialog extends Mixins(BaseMixin) {
    mdiCog = mdiCog
    mdiUsb = mdiUsb
    mdiCloseThick = mdiCloseThick

    tab = 'usb'
    hideSystemEntries = true

    @Prop({ type: Boolean, default: false }) showDialog!: boolean

    get tabs() {
        return [
            {
                name: 'usb',
                content: 'USB',
            },
            {
                name: 'serial',
                content: 'Serial',
            },
            // only show CAN, when a device exists
            {
                name: 'can',
                content: 'CAN',
            },
            {
                name: 'video',
                content: 'Video',
            },
        ]
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>

<style scoped></style>
