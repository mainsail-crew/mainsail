<template>
    <v-tooltip top>
        <template #activator="{ on, attrs }">
            <div :style="presetStyle" v-bind="attrs" v-on="on" @click="usePreset" />
        </template>
        <span>{{ name }}</span>
    </v-tooltip>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

@Component
export default class MiscellaneousLightNeopixelDialogPreset extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) preset!: GuiMiscellaneousStateEntryPreset

    get name() {
        return this.preset.name
    }

    get presetStyle() {
        const red = this.preset.red ?? 0
        const green = this.preset.green ?? 0
        const blue = this.preset.blue ?? 0
        const white = this.preset.white ?? 0
        const RGBSum = red + green + blue

        if (RGBSum && white > 0) {
            return { backgroundColor: `rgb(${white}%, ${white}%, ${white}%)` }
        }

        return { backgroundColor: `rgb(${red}%, ${green}%, ${blue}%)` }
    }

    usePreset() {
        const red = this.preset.red ?? 0
        const green = this.preset.green ?? 0
        const blue = this.preset.blue ?? 0
        const white = this.preset.white ?? 0

        this.$emit('update-color', { red, green, blue, white })
    }
}
</script>
