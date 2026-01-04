<template>
    <v-dialog v-model="showDialog" width="700" @click:outside="closeDialog">
        <panel
            :title="$t('Panels.AfcPanel.AfcSettings')"
            :icon="afcIconLogo"
            card-class="afc-settings-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn
                    text
                    tile
                    href="https://www.armoredturtle.xyz/docs/afc-klipper-add-on/toolhead/calculation.html"
                    target="_blank">
                    <v-icon left>{{ mdiLifebuoy }}</v-icon>
                    {{ $t('Panels.AfcPanel.SettingsDialog.Help') }}
                </v-btn>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <overlay-scrollbars class="height500">
                <v-card-text class="d-flex flex-column gap-3">
                    <afc-settings-dialog-hub v-for="hub in afcHubs" :key="hub" :name="hub" />
                    <afc-settings-dialog-extruder v-for="extruder in afcExtruders" :key="extruder" :name="extruder" />
                    <afc-settings-dialog-lane v-for="lane in afcLanes" :key="lane" :name="lane" />
                </v-card-text>
            </overlay-scrollbars>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiLifebuoy } from '@mdi/js'
import AfcMixin from '@/components/mixins/afc'
import { afcIconLogo } from '@/plugins/afcIcons'

@Component({
    components: { Panel },
})
export default class AfcSettingsDialog extends Mixins(BaseMixin, AfcMixin) {
    afcIconLogo = afcIconLogo
    mdiCloseThick = mdiCloseThick
    mdiLifebuoy = mdiLifebuoy

    @VModel({ type: Boolean }) showDialog!: boolean

    closeDialog() {
        this.showDialog = false
    }
}
</script>

<style scoped>
.gap-3 {
    gap: 12px;
}

.height500 {
    max-height: 500px;
}
</style>
