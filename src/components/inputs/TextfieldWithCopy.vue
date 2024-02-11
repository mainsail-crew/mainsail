<template>
    <v-text-field :class="cssClassName" readonly dense outlined hide-details :label="label" :value="value">
        <template #append>
            <v-icon @click="copy">{{ mdiContentCopy }}</v-icon>
            <v-tooltip
                v-model="isShowTooltip"
                open-on-click
                :open-on-hover="false"
                :attach="'.' + cssClassName"
                :position-x="50"
                :position-y="0">
                <span>{{ $t('App.TextfieldWithCopy.Copied') }}</span>
            </v-tooltip>
        </template>
    </v-text-field>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiContentCopy } from '@mdi/js'
import { copyToClipboard } from '@/plugins/helpers'
import { v4 as uuidv4 } from 'uuid'

@Component
export default class TextfieldWithCopy extends Mixins(BaseMixin) {
    mdiContentCopy = mdiContentCopy

    @Prop({ type: String, required: true }) label!: string
    @Prop({ type: String, required: true }) value!: string

    isShowTooltip = false
    cssClassName = ''

    mounted() {
        this.cssClassName = `textfield-with-copy-${uuidv4()}`
    }

    copy() {
        copyToClipboard(this.value)

        this.isShowTooltip = true
        setTimeout(() => (this.isShowTooltip = false), 2000)
    }
}
</script>
<style scoped>
::v-deep .v-tooltip__content {
    top: 4px !important;
    left: auto !important;
    right: 46px;
}
</style>
