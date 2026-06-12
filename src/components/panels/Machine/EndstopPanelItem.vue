<template>
    <v-row>
        <v-col class="py-1">
            <label class="mt-1 d-inline-block">
                <span v-if="item.type === 'endstop'" class="mr-2">{{ $t('Machine.EndstopPanel.Endstop') }}</span>
                <b>{{ name }}</b>
            </label>
            <v-chip size="small" label class="float-right" :color="chipColor" text-color="white">{{ value }}</v-chip>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { convertName } from '@/plugins/helpers'
import type { EndstopItem } from '@/store/printer/types'

const props = defineProps<{
    item: EndstopItem
}>()

const { t } = useI18n()

const name = computed(() => {
    if (props.item.type === 'endstop') return props.item.name.toUpperCase()
    return convertName(props.item.name)
})

const chipColor = computed(() => props.item.value === 'open' ? 'green' : 'red')

const value = computed(() =>
    props.item.value === 'open'
        ? t('Machine.EndstopPanel.open')
        : t('Machine.EndstopPanel.TRIGGERED')
)
</script>
