<template>
    <v-dialog v-model="showDialog" width="400">
        <panel
            :title="$t('Panels.AfcPanel.FilamentForLane', { name })"
            :icon="afcIconLogo"
            card-class="afc-unit-lane-filament-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <settings-row
                    :title="$t('Panels.AfcPanel.Material')"
                    :sub-title="$t('Panels.AfcPanel.MaterialSubtitle')">
                    <v-text-field v-model="material" placeholder="ABS" dense outlined hide-details />
                </settings-row>
                <v-divider class="my-3" />
                <settings-row :title="$t('Panels.AfcPanel.Weight')" :sub-title="$t('Panels.AfcPanel.WeightSubtitle')">
                    <v-text-field
                        v-model="weight"
                        placeholder="1000"
                        dense
                        outlined
                        type="number"
                        :min="0"
                        :step="1"
                        hide-details />
                </settings-row>
                <v-divider class="my-3" />
                <v-color-picker hide-mode-switch mode="hexa" :value="color" class="mx-auto" @update:color="setColor" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text color="disabled" @click="closeDialog">{{ $t('Panels.AfcPanel.Cancel') }}</v-btn>
                <v-btn :disabled="disableSetBtn" color="primary" text @click="setSpool">
                    {{ $t('Panels.AfcPanel.SetSpool') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import AfcMixin from '@/components/mixins/afc'
import { afcIconLogo } from '@/plugins/afcIcons'
import { VColorPickerColor } from 'vuetify/src/components/VColorPicker/util'
import { Debounce } from 'vue-debounce-decorator'

@Component({
    components: { Panel },
})
export default class AfcUnitLaneFilamentDialog extends Mixins(BaseMixin, AfcMixin) {
    afcIconLogo = afcIconLogo
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: String, required: true }) readonly name!: string

    color = '#000000'
    material = ''
    weight = 0

    get lane() {
        return this.getAfcLaneObject(this.name)
    }

    get currentColor() {
        return this.lane.color ?? '#000000'
    }

    get currentMaterial() {
        return this.lane.material ?? ''
    }

    get currentWeight() {
        return Math.round(this.lane.weight ?? 0)
    }

    get disableSetBtn() {
        return !this.material || !this.weight || !this.color
    }

    @Debounce(500)
    setColor(newColor: VColorPickerColor) {
        this.color = newColor.hex
    }

    setSpool() {
        const gcode = []

        if (this.color !== this.currentColor) {
            const cleanedColor = this.color.replace('#', '')
            gcode.push(`SET_COLOR LANE=${this.name} COLOR=${cleanedColor}`)
        }
        if (this.material !== this.currentMaterial) {
            gcode.push(`SET_MATERIAL LANE=${this.name} MATERIAL=${this.material}`)
        }
        if (this.weight !== this.currentWeight) {
            gcode.push(`SET_WEIGHT LANE=${this.name} WEIGHT=${this.weight}`)
        }

        this.doSend(gcode.join('\n'))
        this.closeDialog()
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    closeDialog() {
        this.showDialog = false
    }

    @Watch('show')
    onShowChange(newValue: boolean) {
        if (!newValue) return

        this.color = this.currentColor
        this.material = this.currentMaterial
        this.weight = this.currentWeight
    }
}
</script>
