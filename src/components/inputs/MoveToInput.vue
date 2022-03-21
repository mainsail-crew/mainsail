<style lang="scss">
label {
    font-size: 14px !important;
    color: rgba(255, 255, 255, 0.5) !important;
}
</style>

<template>
    <v-text-field
        v-model="position"
        :suffix="suffix"
        :disabled="disabled"
        :readonly="readonly"
        :error="!validate"
        :error-messages="getErrorMsg()"
        hide-details="auto"
        type="number"
        hide-spin-buttons
        outlined
        reverse
        dense
        @change="validate"
        @keyup="validate"
        @blur="onBlur"
        @focus="!readonly ? $event.target.select() : {}">
        <template #label>
            <span>{{ label }}</span>
        </template>
    </v-text-field>
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

    @Prop({ type: Number, required: true })
    declare readonly positionMax: number

    @Prop({ type: Number, required: true })
    declare readonly positionMin: number

    @Prop({ type: Boolean, required: false })
    declare readonly disabled: boolean

    @Prop({ type: Boolean, required: false })
    declare readonly readonly: boolean

    onBlur() {
        if (!this.validate() && this.position !== this.currentPos) {
            this.position = this.currentPos
            this.$emit('validate', { axis: this.suffix.toLowerCase(), valid: true })
        }
    }

    validate(): boolean {
        const isValid =
            this.position !== '' &&
            parseFloat(this.position) <= this.positionMax &&
            parseFloat(this.position) >= this.positionMin
        this.$emit('validate', { axis: this.suffix.toLowerCase(), valid: isValid })
        return isValid
    }

    getErrorMsg() {
        const errors = []
        if (this.position === '') {
            errors.push('Invalid!')
        }
        if (parseFloat(this.position) > this.positionMax || parseFloat(this.position) < this.positionMin) {
            errors.push('Out of range')
        }
        return errors
    }
}
</script>
