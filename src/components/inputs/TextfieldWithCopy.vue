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
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mdiContentCopy } from '@mdi/js'
import { copyToClipboard } from '@/plugins/helpers'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
    label: string
    value: string
}>()

const isShowTooltip = ref(false)
const cssClassName = ref('')

onMounted(() => {
    cssClassName.value = `textfield-with-copy-${uuidv4()}`
})

function copy() {
    copyToClipboard(props.value)

    isShowTooltip.value = true
    setTimeout(() => (isShowTooltip.value = false), 2000)
}
</script>
<style scoped>
::v-deep .v-tooltip__content {
    top: 4px !important;
    left: auto !important;
    right: 46px;
}
</style>
