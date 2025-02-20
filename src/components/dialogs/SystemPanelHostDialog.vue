<template>
    <v-dialog :value="show" :max-width="600" :max-height="500" scrollable>
        <panel
            :title="$t('Machine.SystemPanel.HostDetails')"
            :icon="mdiTextBoxSearchOutline"
            card-class="machine-systemload-host-details-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pt-5 px-0">
                <overlay-scrollbars style="height: 350px" class="px-6">
                    <template v-if="Object.keys(systemInfo).length">
                        <SystemPanelDialogSection
                            v-for="(infoGroup, key, index) of systemInfo"
                            :key="key"
                            :name="key"
                            :entries="infoGroup"
                            :margin-top="index !== 0" />
                    </template>
                    <v-row v-else class="mt-5">
                        <v-col>
                            <p>{{ $t('Machine.SystemPanel.NoMoreInfos') }}</p>
                        </v-col>
                    </v-row>
                </overlay-scrollbars>
            </v-card-text>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiTextBoxSearchOutline } from '@mdi/js'

@Component
export default class SystemPanelMcuDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiTextBoxSearchOutline = mdiTextBoxSearchOutline

    @Prop({ required: true, type: String }) readonly name!: string
    @Prop({ required: true, type: Boolean }) readonly show!: boolean

    get systemInfo() {
        return this.$store.state.server?.system_info ?? {}
    }

    closeDialog() {
        this.$emit('close')
    }
}
</script>
