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
                <v-card-text class="px-0 pb-0">
                    <v-data-table
                        :headers="headers"
                        :items="spools"
                        item-key="name"
                        class="elevation-1"
                        :search="search">
                        <template #no-data>
                            <div class="text-center">{{ $t('Panels.Spoolman.NoSpools') }}</div>
                        </template>

                        <template #item="{ item }">
                            <tr :key="item.filename" class="cursor-pointer">
                                <td></td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
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
                text: this.$t('Panels.Spoolman.Filament'),
                align: 'start',
                filterable: false,
                value: 'name',
            },
        ]
    }

    @Watch('spools')
    onSpoolsChanged(newVal: any) {
        window.console.log(newVal)
    }

    refresh() {
        this.$store.dispatch('server/spoolman/refreshSpools')
    }

    close() {
        this.$emit('close')
    }
}
</script>
