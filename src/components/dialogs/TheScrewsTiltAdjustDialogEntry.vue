<template>
    <settings-row :title="outputName" :sub-title="subTitle">
        <v-chip v-if="!(is_base ?? false)" label small>
            <v-icon v-if="sign === 'CCW'" small left>{{ mdiRotateLeft }}</v-icon>
            <v-icon v-if="sign === 'CW'" small left>{{ mdiRotateRight }}</v-icon>
            {{ adjust }}
        </v-chip>
        <v-chip v-else label small>{{ $t('ScrewsTiltAdjust.Base') }}</v-chip>
    </settings-row>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiRotateLeft, mdiRotateRight } from '@mdi/js'

interface ScrewsTiltAdjustResult {
    z: number
    sign?: string
    adjust?: string
    is_base: boolean
}

const store = useStore()

const props = defineProps({
    name: { type: String, required: true },
    result: { type: Object as () => ScrewsTiltAdjustResult, required: true },
})

const settings = computed(() => store.state.printer.configfile?.settings?.screws_tilt_adjust ?? {})

const outputName = computed(() => settings.value[props.name + '_name'] ?? 'Unknown')

const coordinates = computed(() => settings.value[props.name] ?? [0, 0])

const x = computed(() => coordinates.value[0] ?? 0)

const y = computed(() => coordinates.value[1] ?? 0)

const z = computed(() => props.result.z.toFixed(3))

const subTitle = computed(() => `(X: ${x.value}, Y: ${y.value}, Z: ${z.value})`)

const sign = computed(() => props.result.sign ?? '')

const adjust = computed(() => props.result.adjust ?? '00:00')

const is_base = computed(() => props.result.is_base ?? false)
</script>
