<template>
    <v-list-item>
        <v-row>
            <v-col class="col-auto px-0">
                <v-icon class="handle pr-2">{{ mdiDragVertical }}</v-icon>
                <v-icon>{{ icon }}</v-icon>
            </v-col>
            <v-col class="pr-0 text-truncate">
                {{ panelname }}
            </v-col>
            <v-col class="col-auto pl-2">
                <v-icon
                    :color="checkboxColor"
                    @click.stop="$emit('change-visible', name, !visible)"
                    v-html="checkboxIcon" />
            </v-col>
        </v-row>
    </v-list-item>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDragVertical, mdiInformation } from '@mdi/js'
import DashboardMixin from '@/components/mixins/dashboard'

@Component({
    components: { draggable },
})
export default class SettingsDashboardSortableItem extends Mixins(DashboardMixin) {
    /**
     * Icons
     */
    mdiInformation = mdiInformation
    mdiDragVertical = mdiDragVertical

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Boolean, required: true }) declare readonly visible: boolean

    get panelname() {
        return this.getPanelName(this.name)
    }

    get icon() {
        return this.convertPanelnameToIcon(this.name)
    }

    get checkboxColor() {
        if (this.visible) return 'primary'

        return 'grey lighten-1'
    }

    get checkboxIcon() {
        if (this.visible) return mdiCheckboxMarked

        return mdiCheckboxBlankOutline
    }
}
</script>

<style scoped>
.handle {
    cursor: move;
}
</style>
