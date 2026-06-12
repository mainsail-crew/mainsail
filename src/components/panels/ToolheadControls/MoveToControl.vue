<template>
    <v-container v-if="showCoordinates || showPosition" :class="containerClass">
        <responsive
            :breakpoints="{
                xsmall: (el) => el.width <= 320,
                small: (el) => el.width > 320 && el.width <= 460,
                medium: (el) => el.width > 460 && el.width <= 560,
                large: (el) => el.width > 560,
            }">
            <template #default="{ el }">
                <v-row v-if="showPosition" class="flex-nowrap pb-1">
                    <v-col
                        :class="{
                            'v-col-5': el.is.small,
                            'v-col-4': el.is.xsmall || el.is.medium,
                            'v-col-3': el.is.large,
                        }"
                        class="text-subtitle-2 text-secondary mr-2 d-flex align-center">
                        <v-icon size="small" class="mr-1">{{ mdiCrosshairsGps }}</v-icon>
                        <span v-if="!el.is.xsmall" class="text-no-wrap">
                            {{ $t('Panels.ToolheadControlPanel.Position') }}:&nbsp;
                        </span>
                        <span class="text-no-wrap">{{ displayPositionAbsolute }}</span>
                    </v-col>
                    <v-col
                        v-if="currentProfileName"
                        class="text-subtitle-2 text-secondary pl-2 justify-end text-no-wrap text-truncate d-flex align-center">
                        <v-icon size="small" class="mr-1">{{ mdiGrid }}</v-icon>
                        <span class="text-no-wrap text-truncate">{{ currentProfileName }}</span>
                    </v-col>
                </v-row>
                <v-row v-if="showCoordinates" density="compact">
                    <v-col :class="el.is.xsmall ? 'v-col-12' : 'v-col-4'">
                        <move-to-input
                            :position="input.x.pos"
                            @update:position="setInputXPos"
                            :label="livePositions.x"
                            :suffix="'X'"
                            :step="0.01"
                            :current-pos="gcodePositions.x"
                            :readonly="['printing'].includes(printer_state)"
                            :disabled="!xAxisHomed"
                            @submit="sendCmd" />
                    </v-col>
                    <v-col :class="el.is.xsmall ? 'v-col-12' : 'v-col-4'">
                        <move-to-input
                            :position="input.y.pos"
                            @update:position="setInputYPos"
                            :label="livePositions.y"
                            :suffix="'Y'"
                            :step="0.01"
                            :current-pos="gcodePositions.y"
                            :readonly="['printing'].includes(printer_state)"
                            :disabled="!yAxisHomed"
                            @submit="sendCmd" />
                    </v-col>
                    <v-col :class="el.is.xsmall ? 'v-col-12' : 'v-col-4'">
                        <move-to-input
                            :position="input.z.pos"
                            @update:position="setInputZPos"
                            :label="livePositions.z"
                            :suffix="'Z'"
                            :step="0.001"
                            :current-pos="gcodePositions.z"
                            :readonly="['printing'].includes(printer_state)"
                            :disabled="!zAxisHomed"
                            @submit="sendCmd" />
                    </v-col>
                </v-row>
            </template>
        </responsive>
    </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useSocket } from '@/composables/useSocket'
import { useI18n } from 'vue-i18n'
import MoveToInput from '@/components/inputs/MoveToInput.vue'
import Responsive from '@/components/ui/Responsive.vue'
import { mdiCrosshairsGps, mdiGrid } from '@mdi/js'

const { printer_state } = useBase()
const {
    xAxisHomed, yAxisHomed, zAxisHomed,
    feedrateXY, feedrateZ,
    existsClientLinearMoveMacro,
} = useControl()
const store = useStore()
const socket = useSocket()
const { t } = useI18n()

interface MoveToAxisInput {
    pos: string
    valid: boolean
}

interface MoveToInputs {
    x: MoveToAxisInput
    y: MoveToAxisInput
    z: MoveToAxisInput
}

const input = ref<MoveToInputs>({
    x: { pos: '', valid: true },
    y: { pos: '', valid: true },
    z: { pos: '', valid: true },
})

function setInputXPos(val: string) {
    input.value.x.pos = val
}

function setInputYPos(val: string) {
    input.value.y.pos = val
}

function setInputZPos(val: string) {
    input.value.z.pos = val
}

const gcodePositions = computed(() => {
    const pos = store.state.printer.gcode_move?.gcode_position ?? [0, 0, 0]
    return {
        x: pos[0]?.toFixed(2) ?? '--',
        y: pos[1]?.toFixed(2) ?? '--',
        z: pos[2]?.toFixed(3) ?? '--',
    }
})

watch(() => gcodePositions.value.x, (newVal) => {
    input.value.x.pos = newVal
}, { immediate: true })

watch(() => gcodePositions.value.y, (newVal) => {
    input.value.y.pos = newVal
}, { immediate: true })

watch(() => gcodePositions.value.z, (newVal) => {
    input.value.z.pos = newVal
}, { immediate: true })

const displayPositionAbsolute = computed(() =>
    positionAbsolute.value
        ? t('Panels.ToolheadControlPanel.Absolute')
        : t('Panels.ToolheadControlPanel.Relative')
)

const positionAbsolute = computed(() =>
    store.state.printer.gcode_move?.absolute_coordinates ?? true
)

const livePositions = computed(() => {
    const pos = store.state.printer.motion_report?.live_position ?? [0, 0, 0]
    return {
        x: pos[0]?.toFixed(2) ?? '--',
        y: pos[1]?.toFixed(2) ?? '--',
        z: pos[2]?.toFixed(3) ?? '--',
    }
})

const bed_mesh = computed(() => store.state.printer.bed_mesh ?? null)

const currentProfileName = computed(() => bed_mesh.value?.profile_name ?? '')

const showPosition = computed(() => store.state.gui.view.toolhead.showPosition ?? true)

const showCoordinates = computed(() => store.state.gui.view.toolhead.showCoordinates ?? true)

const showControl = computed(() => store.state.gui.view.toolhead.showControl ?? true)

const containerClass = computed(() => showControl.value ? 'pb-0' : '')

function sendCmd(): void {
    const gcode: string[] = []
    if (!existsClientLinearMoveMacro.value) {
        gcode.push('SAVE_GCODE_STATE NAME=_ui_movement')
        gcode.push('G90')
    }

    if (input.value.z.pos !== gcodePositions.value.z) {
        if (existsClientLinearMoveMacro.value)
            gcode.push(`_CLIENT_LINEAR_MOVE Z=${input.value.z.pos} F=${feedrateZ.value * 60} ABSOLUTE=1`)
        else gcode.push(`G1 Z${input.value.z.pos} F${feedrateZ.value * 60}`)
    }

    if (input.value.x.pos !== gcodePositions.value.x || input.value.y.pos !== gcodePositions.value.y) {
        let xPos = ''
        let yPos = ''

        if (existsClientLinearMoveMacro.value) {
            if (input.value.x.pos !== gcodePositions.value.x) xPos = ` X=${input.value.x.pos}`
            if (input.value.y.pos !== gcodePositions.value.y) yPos = ` Y=${input.value.y.pos}`

            gcode.push(`_CLIENT_LINEAR_MOVE${xPos}${yPos} F=${feedrateXY.value * 60} ABSOLUTE=1`)
        } else {
            if (input.value.x.pos !== gcodePositions.value.x) xPos = ` X${input.value.x.pos}`
            if (input.value.y.pos !== gcodePositions.value.y) yPos = ` Y${input.value.y.pos}`

            gcode.push(`G1${xPos}${yPos} F${feedrateXY.value * 60}`)
        }
    }

    if (!existsClientLinearMoveMacro.value) {
        gcode.push('RESTORE_GCODE_STATE NAME=_ui_movement')
    }

    const gcodeStr = gcode.join('\n')

    if (input.value.x.valid && input.value.y.valid && input.value.z.valid) {
        store.dispatch('server/addEvent', { message: gcodeStr, type: 'command' })
        socket.emit('printer.gcode.script', { script: gcodeStr })
    }

    return
}
</script>
