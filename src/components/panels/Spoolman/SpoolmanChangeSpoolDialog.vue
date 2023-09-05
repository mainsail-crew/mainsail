<template>
    <div>
        <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
            <panel
                :title="$t('Panels.Spoolman.ChangeSpool')"
                :icon="mdiAdjust"
                card-class="spoolman-change-spool-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="close">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-title>
                    <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details />
                </v-card-title>
                <v-card-text>
                    <v-data-table
                        :headers="headers"
                        :items="spools"
                        item-key="name"
                        class="elevation-1"
                        :search="search"
                        :custom-filter="filterOnlyCapsText"></v-data-table>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiAdjust } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class SpoolmanChangeSpoolDialog extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true }) declare readonly showDialog: boolean

    search = ''

    get spools() {
        return this.$store.state.server.spoolman.spools ?? []
    }

    get headers() {
        return [
            {
                text: 'Name',
                align: 'start',
                filterable: false,
                value: 'name',
            },
        ]
    }

    close() {
        this.$emit('close')
    }
}
</script>
