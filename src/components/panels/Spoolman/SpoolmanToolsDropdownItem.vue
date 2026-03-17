<template>
    <v-list-item>
        <v-btn small @click="showChangeSpoolDialog = true">
            <span v-if="color != null" class="_extruderColorState mr-2" :style="dotStyle" />
            {{ name }}
            <span v-if="spoolId === null" class="font-italic ml-1">({{ $t('Panels.SpoolmanPanel.NoSpool') }})</span>
            <span v-else class="ml-1">({{ spool?.filament?.name ?? '--' }})</span>
        </v-btn>
        <v-btn v-if="spoolId !== null" icon x-small class="ml-1" :title="$t('Panels.SpoolmanPanel.EjectSpool')" @click="ejectSpool">
            <v-icon small>{{ mdiEject }}</v-icon>
        </v-btn>
        <spoolman-change-spool-dialog v-model="showChangeSpoolDialog" :tool-index="toolIndex" />
    </v-list-item>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'
import { mdiEject } from '@mdi/js'

@Component({
    components: { SpoolmanChangeSpoolDialog },
})
export default class SpoolmanToolsDropdownItem extends Mixins(BaseMixin) {
    mdiEject = mdiEject

    @Prop({ required: true }) readonly toolIndex!: number

    showChangeSpoolDialog = false

    get name() {
        return `T${this.toolIndex}`
    }

    get color() {
        return this.spool?.filament?.color_hex ?? '000000'
    }

    get dotStyle() {
        return {
            'background-color': '#' + this.color,
        }
    }

    get spoolId(): number | null {
        // Prefer Moonraker API tool_spools
        const toolSpools = this.$store.state.server.spoolman.tool_spools ?? {}
        if (this.toolIndex in toolSpools) {
            return toolSpools[this.toolIndex] ?? null
        }

        // Fall back to legacy gcode_macro detection
        const macroName = `gcode_macro T${this.toolIndex}`
        const object = this.$store.state.printer[macroName] ?? {}
        return object.spool_id ?? null
    }

    get spool(): ServerSpoolmanStateSpool | null {
        // Prefer tool_spool_details from Moonraker API
        const detail = this.$store.state.server.spoolman.tool_spool_details?.[this.toolIndex] ?? null
        if (detail) return detail

        // Fall back to searching spools list
        if (this.spoolId === null) return null
        return this.spools.find((spool) => spool.id === this.spoolId) ?? null
    }

    get spools(): ServerSpoolmanStateSpool[] {
        return this.$store.state.server.spoolman.spools ?? []
    }

    ejectSpool() {
        const toolSpools = this.$store.state.server.spoolman.tool_spools ?? {}
        if (this.toolIndex in toolSpools) {
            // Native Moonraker API path
            this.$store.dispatch('server/spoolman/setToolSpool', {
                tool: this.toolIndex,
                spool_id: null,
            })
        } else {
            // Legacy gcode_macro path
            const macroName = `T${this.toolIndex}`
            this.$store.dispatch('printer/sendGcode', `SET_GCODE_VARIABLE MACRO=${macroName} VARIABLE=spool_id VALUE=0`)
        }
    }
}
</script>

<style scoped>
._extruderColorState {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid lightgray;
}
</style>
