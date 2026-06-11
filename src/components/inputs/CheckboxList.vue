<template>
    <v-col class="pl-6">
        <template v-if="props.selectAll">
            <v-checkbox
                v-model="selectAllModel"
                :label="$t('Settings.GeneralTab.Everything')"
                hide-details
                class="mt-0"
                :indeterminate="selectAllIndeterminate"
                @change="emit('update:selectedCheckboxes', selectedCheckboxes)"></v-checkbox>
            <v-divider class="my-2" />
        </template>
        <template v-for="option in props.options" :key="option.value">
            <v-checkbox
                v-model="selectedCheckboxes"
                :label="option.label"
                hide-details
                class="mt-0"
                :value="option.value"
                @change="emit('update:selectedCheckboxes', selectedCheckboxes)"></v-checkbox>
        </template>
    </v-col>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBase } from '@/composables/useBase'
import { TranslateResult } from 'vue-i18n'

const props = defineProps<{
    options: { label: string | TranslateResult; value: string }[]
    selectAll?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:selectedCheckboxes', value: (string | TranslateResult)[]): void
}>()

useBase()

const selectedCheckboxes = ref<(string | TranslateResult)[]>([])
const selectAllIndeterminate = ref(false)

function getSelectAll(): boolean {
    selectAllIndeterminate.value = false
    if (0 < selectedCheckboxes.value.length && selectedCheckboxes.value.length < props.options.length) {
        selectAllIndeterminate.value = true
        return false
    }
    return selectedCheckboxes.value.length == props.options.length
}

function setSelectAll(state: boolean) {
    if (state) {
        selectedCheckboxes.value = props.options.map((o) => o.value)
        return
    }
    selectedCheckboxes.value = []
}

const selectAllModel = computed<boolean>({
    get: getSelectAll,
    set: setSelectAll,
})
</script>
