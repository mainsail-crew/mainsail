<template>
    <v-col class="pl-6">
        <template v-if="selectAll">
            <v-checkbox
                v-model="selectAllModel"
                :label="$t('Settings.GeneralTab.Everything')"
                hide-details
                class="mt-0"
                :indeterminate="selectAllIndeterminate"
                @change="$emit('update:selectedCheckboxes', selectedCheckboxes)"></v-checkbox>
            <v-divider class="my-2" />
        </template>
        <template v-for="option in options">
            <v-checkbox
                :key="option.value"
                v-model="selectedCheckboxes"
                :label="option.label"
                hide-details
                class="mt-0"
                :value="option.value"
                @change="$emit('update:selectedCheckboxes', selectedCheckboxes)"></v-checkbox>
        </template>
    </v-col>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { computed } from 'vue'
import { TranslateResult } from 'vue-i18n'

@Component
export default class CheckboxList extends Mixins(BaseMixin) {
    @Prop({ required: true })
    declare readonly options: { label: string | TranslateResult; value: string }[]

    @Prop({ type: Boolean, required: false, default: false })
    declare readonly selectAll: boolean

    selectedCheckboxes: (string | TranslateResult)[] = []
    selectAllIndeterminate: boolean = false
    selectAllModel = computed<boolean>({
        get: this.getSelectAll,
        set: this.setSelectAll,
    })

    getSelectAll(): boolean {
        this.selectAllIndeterminate = false
        if (0 < this.selectedCheckboxes.length && this.selectedCheckboxes.length < this.options.length) {
            this.selectAllIndeterminate = true
            return false
        }

        return this.selectedCheckboxes.length == this.options.length
    }

    setSelectAll(state: boolean) {
        if (state) {
            this.selectedCheckboxes = this.options.map((o) => o.value)
            return
        }

        this.selectedCheckboxes = []
    }
}
</script>
