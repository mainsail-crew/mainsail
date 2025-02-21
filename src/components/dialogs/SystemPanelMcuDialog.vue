<template>
    <v-dialog :value="show" :max-width="400" :max-height="500" scrollable>
        <panel
            :title="name"
            icon="mdi-text-box-search-outline"
            card-class="machine-systemload-mcu-details-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pt-5 px-0">
                <overlay-scrollbars style="height: 350px" class="px-6">
                    <div v-for="(group, index) in values" :key="index">
                        <v-divider v-if="index" class="my-3" />
                        <v-row>
                            <v-col>
                                <span class="headline">{{ group.headline }}</span>
                            </v-col>
                        </v-row>
                        <div v-for="(value, key, index2) in group.values" :key="key">
                            <v-divider v-if="index2" class="my-3" />
                            <v-row>
                                <v-col>{{ key }}</v-col>
                                <v-col class="text-right">{{ value }}</v-col>
                            </v-row>
                        </div>
                    </div>
                </overlay-scrollbars>
            </v-card-text>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick } from '@mdi/js'

@Component
export default class SystemPanelMcuDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true, type: String }) readonly name!: string
    @Prop({ required: true, type: Boolean }) readonly show!: boolean

    get mcu() {
        return this.$store.state.printer[this.name]
    }

    get constants() {
        return this.mcu.mcu_constants ?? null
    }

    get lastStats() {
        return this.mcu.last_stats ?? null
    }

    get values() {
        const output: { headline: string; values: object }[] = []

        if (this.constants) {
            output.push({ headline: this.$t('Machine.SystemPanel.Constants').toString(), values: this.constants })
        }

        if (this.lastStats) {
            output.push({ headline: this.$t('Machine.SystemPanel.LastStats').toString(), values: this.lastStats })
        }

        return output
    }

    closeDialog() {
        this.$emit('close')
    }
}
</script>
