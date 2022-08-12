<template>
    <form @submit.prevent="submit">
        <v-text-field
            v-model="position"
            :label="`[ ${label} ]`"
            :suffix="suffix"
            :disabled="disabled"
            :step="step"
            :readonly="readonly"
            hide-details="auto"
            type="number"
            hide-spin-buttons
            outlined
            reverse
            dense
            @blur="onBlur"
            @focus="!readonly ? $event.target.select() : {}"></v-text-field>
    </form>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({
    components: {},
})
export default class MoveToInput extends Mixins(BaseMixin) {
    @VModel({ type: String })
    declare position: string

    @Prop({ type: String, required: true })
    declare readonly currentPos: string

    @Prop({ type: String, required: false })
    declare readonly label: string

    @Prop({ type: String, required: false })
    declare readonly suffix: string

    @Prop({ type: Number, required: false, default: 1 })
    declare readonly step: number

    @Prop({ type: Boolean, required: false })
    declare readonly disabled: boolean

    @Prop({ type: Boolean, required: false })
    declare readonly readonly: boolean

    onBlur() {
        if (this.position !== this.currentPos) {
            this.position = this.currentPos
        }
    }

    submit(): void {
        this.$emit('submit')
    }
}
</script>
