<template>
    <v-text-field
        v-model="position"
        :label="`[ ${label} ]`"
        :suffix="suffix"
        :disabled="disabled"
        :readonly="readonly"
        :error="!validate"
        hide-details="auto"
        type="number"
        hide-spin-buttons
        outlined
        reverse
        dense
        @blur="onBlur"
        @focus="!readonly ? $event.target.select() : {}">
        <template v-if="errorMsg.length" #append>
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <v-icon color="error" v-bind="attrs" v-on="on">{{ mdiAlert }}</v-icon>
                </template>
                <span>{{ errorMsg.join(', ') }}</span>
            </v-tooltip>
        </template>
    </v-text-field>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiAlert } from '@mdi/js'

@Component({
    components: {},
})
export default class MoveToInput extends Mixins(BaseMixin) {
    mdiAlert = mdiAlert

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
        if (!this.validate && this.position !== this.currentPos) {
            this.position = this.currentPos
            this.$emit('validate', { axis: this.suffix.toLowerCase(), valid: true })
        }
    }

    get validate(): boolean {
        const isValid =
            this.position !== '' &&
            parseFloat(this.position) <= this.positionMax &&
            parseFloat(this.position) >= this.positionMin
        this.$emit('validate', { axis: this.suffix.toLowerCase(), valid: isValid })
        return isValid
    }

    get errorMsg() {
        const errors = []
        if (this.position === '') errors.push(this.$t('Panels.ToolheadControlPanel.Invalid'))
        if (parseFloat(this.position) > this.positionMax || parseFloat(this.position) < this.positionMin)
            errors.push(this.$t('Panels.ToolheadControlPanel.OutOfRange'))

        return errors
    }
}
</script>

<style>
label {
    font-size: 14px !important;
    color: rgba(255, 255, 255, 0.5) !important;
}

.v-input.error--text .v-input__slot {
    padding-left: 3px !important;
}

.v-input.error--text .v-input__append-inner {
    margin-right: 5px !important;
}
</style>
