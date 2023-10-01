<template>
    <v-dialog v-model="boolShowDialog" persistent max-width="800">
        <panel
            :title="$t('Machine.UpdatePanel.UpgradeableSystemPackages')"
            :icon="mdiPackageVariantClosed"
            :margin-bottom="false"
            card-class="machine-update-system-packages-list-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p>{{ $t('Machine.UpdatePanel.ThesePackagesCanBeUpgrade') }}</p>
                        <p class="system-packages-list">{{ packagesList.join(', ') }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text color="primary" @click="closeDialog">{{ $t('Machine.UpdatePanel.Close') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiPackageVariantClosed } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: { Panel },
})
export default class SystemPackagesList extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiPackageVariantClosed = mdiPackageVariantClosed

    @Prop({ required: true }) readonly boolShowDialog!: boolean
    @Prop({ required: true }) readonly packagesList!: string[]

    closeDialog() {
        this.$emit('close-dialog')
    }
}
</script>

<style scoped>
.system-packages-list {
    font-family: monospace;
    margin-bottom: 0 !important;
}
</style>
