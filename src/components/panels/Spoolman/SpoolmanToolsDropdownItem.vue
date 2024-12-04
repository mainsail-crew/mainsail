<template>
    <v-list-item>
        <v-btn small @click="showChangeSpoolDialog = true">
            <span v-if="color != null" class="_extruderColorState mr-2" :style="dotStyle" />
            {{ name }}
            <span v-if="spoolId === null" class="font-italic ml-1">({{ $t('Panels.SpoolmanPanel.NoSpool') }})</span>
            <span v-else class="ml-1">({{ spool?.filament?.name ?? '--' }})</span>
        </v-btn>
        <spoolman-change-spool-dialog
            :show-dialog="showChangeSpoolDialog"
            :tool="name"
            @close="showChangeSpoolDialog = false" />
    </v-list-item>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({
    components: {},
})
export default class SpoolmanToolsDropdownItem extends Mixins(BaseMixin) {
    @Prop({ required: false, default: false }) readonly objectName!: string

    showChangeSpoolDialog = false

    get name() {
        return (this.objectName.split(' ')[1] ?? 'Unknown').toUpperCase()
    }

    get color() {
        return this.spool?.filament?.color_hex ?? '000000'
    }

    get dotStyle() {
        return {
            'background-color': '#' + this.color,
        }
    }

    get spoolId() {
        const object = this.$store.state.printer[this.objectName] ?? {}

        return object.spool_id ?? null
    }

    get spool() {
        return this.spools.find((spool) => spool.id === this.spoolId) ?? null
    }

    get spools(): ServerSpoolmanStateSpool[] {
        return this.$store.state.server.spoolman.spools ?? []
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
