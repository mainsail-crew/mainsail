<template>
    <v-menu offset-y left :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
        <template #activator="{ on, attrs }">
            <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on">
                <v-icon>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-row>
                    <v-col class="pr-0">{{ $t('Files.HiddenFiles') }}</v-col>
                    <v-col class="col-auto pl-0">
                        <v-icon
                            :color="showHiddenFiles ? 'primary' : 'grey lighten-1'"
                            @click.stop="showHiddenFiles = !showHiddenFiles">
                            {{ showHiddenFiles ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-row>
                    <v-col class="pr-0">{{ $t('Files.PrintedFiles') }}</v-col>
                    <v-col class="col-auto pl-0">
                        <v-icon
                            :color="showPrintedFiles ? 'primary' : 'grey lighten-1'"
                            @click.stop="showPrintedFiles = !showPrintedFiles">
                            {{ showPrintedFiles ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <v-divider />
            <draggable
                v-model="configurableHeaders"
                handle=".handle"
                class="v-list-item-group"
                ghost-class="ghost"
                group="gcodeFilesColumnOrder"
                :force-fallback="true">
                <v-list-item v-for="header of configurableHeaders" :key="header.value" class="minHeight36">
                    <v-row>
                        <v-col class="col-auto pr-0">
                            <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                        </v-col>
                        <v-col>{{ header.text }}</v-col>
                        <v-col class="col-auto pl-0">
                            <v-icon
                                :color="header.visible ? 'primary' : 'grey lighten-1'"
                                @click.stop="changeMetadataVisible(header.value)">
                                {{ header.visible ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                            </v-icon>
                        </v-col>
                    </v-row>
                </v-list-item>
            </draggable>
        </v-list>
    </v-menu>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiCog, mdiDragVertical } from '@mdi/js'
import draggable from 'vuedraggable'

@Component({
    components: { draggable },
})
export default class GcodefilesPanelHeaderSettings extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCheckboxBlankOutline = mdiCheckboxBlankOutline
    mdiCheckboxMarked = mdiCheckboxMarked
    mdiCog = mdiCog
    mdiDragVertical = mdiDragVertical

    changeMetadataVisible(name: string) {
        const value = [...(this.$store.state.gui.view.gcodefiles.hideMetadataColumns ?? [])]
        const index = value.findIndex((value: string) => value === name)

        if (index !== -1) value.splice(index, 1)
        else value.push(name)

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.hideMetadataColumns', value })
    }
}
</script>

<style scoped>
.handle {
    cursor: move;
}
</style>
