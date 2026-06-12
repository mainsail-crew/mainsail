<template>
    <tr>
        <td class="icon">
            <v-icon :color="iconColor" :class="iconClass" tabindex="-1" @click="showEditDialog = true">
                {{ mdiFan }}
            </v-icon>
        </td>
        <td class="name">
            <span class="cursor-pointer" @click="showEditDialog = true">{{ formatName }}</span>
        </td>
        <td class="text-no-wrap text-center" colspan="3">
            <temperature-panel-list-item-nevermore-value
                :printer-object="printerObject"
                :object-name="objectName"
                :small="false"
                key-name="gas" />
            <temperature-panel-list-item-nevermore-value
                v-for="keyName in nevermoreValues"
                :key="keyName"
                :printer-object="printerObject"
                :object-name="objectName"
                :key-name="keyName" />
            <div v-if="rpm !== null">
                <small :class="rpmClass">{{ rpm }} RPM</small>
            </div>
        </td>
        <temperature-panel-list-item-edit
            v-model="showEditDialog"
            :object-name="objectName"
            :name="name"
            :format-name="formatName"
            additional-sensor-name="nevermore"
            :icon="mdiFan"
            :color="color" />
    </tr>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { convertName } from '@/plugins/helpers'
import { mdiFan } from '@mdi/js'
import { opacityHeaterActive, opacityHeaterInactive } from '@/store/variables'

const props = defineProps<{
    objectName: string
    isResponsiveMobile: boolean
}>()

const store = useStore()

const showEditDialog = ref(false)
const nevermoreValues = ['temperature', 'pressure', 'humidity']

const printerObject = computed(() => store.state.printer[props.objectName] ?? {})

const name = computed(() => {
    const splits = props.objectName.split(' ')
    return splits.length === 1 ? splits[0] : splits[1]
})

const formatName = computed(() => convertName(name.value))

const color = computed(() =>
    store.state.gui?.view?.tempchart?.datasetSettings?.[props.objectName]?.color ?? '#ffffff'
)

const iconColor = computed(() => {
    if (state.value === null || state.value > 0) return `${color.value}${opacityHeaterActive}`
    return `${color.value}${opacityHeaterInactive}`
})

const iconClass = computed(() => {
    const classes: string[] = ['_no-focus-style', 'cursor-pointer']
    const disableFanAnimation = store.state.gui?.uiSettings.disableFanAnimation ?? false
    if (!disableFanAnimation && (state.value ?? 0) > 0) classes.push('icon-rotate')
    return classes
})

const state = computed<number | null>(() => printerObject.value.speed ?? null)

const rpm = computed(() => {
    const rpmVal = printerObject.value.rpm ?? null
    if (rpmVal === null) return null
    return parseInt(printerObject.value.rpm)
})

const rpmClass = computed(() => {
    if (rpm.value === 0 && (printerObject.value.speed ?? 0) > 0) return 'text-error'
    return ''
})
</script>

<style scoped>
:deep(.v-icon)._no-focus-style:focus::after {
    opacity: 0 !important;
}

:deep(.cursor-pointer) {
    cursor: pointer;
}
</style>
