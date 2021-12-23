<style lang="scss" scoped>

</style>

<template>
    <div>
        <v-dialog v-model="showDialog" width="900" persistent :fullscreen="isMobile">
            <panel :title="$t('Panels.StatusPanel.ExcludeObject.ExcludeObject')" icon="mdi-selection-remove" card-class="exclude-object-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="hideDialog"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-container>
                    <v-row>
                        <v-col class="col-12 col-sm-6 pb-0 pb-sm-3">
                            <status-panel-exclude-object-dialog-map
                                :hover-name="hoverName"
                                @update:name="updateExcludeObjectDialogName"
                                @update:bool="updateExcludeObjectDialogBool"
                            ></status-panel-exclude-object-dialog-map>
                        </v-col>
                        <v-col class="col-12 col-sm-6 pt-0 pt-sm-3">
                            <status-panel-exclude-object-dialog-list
                                :exclude-object-dialog-name.sync="excludeObjectDialogName"
                                @update:name="updateExcludeObjectDialogName"
                                @update:hoverName="updateHoverObjectDialogName"
                                :exclude-object-dialog-bool.sync="excludeObjectDialogBool"
                                @update:bool="updateExcludeObjectDialogBool"
                                :hover-name="hoverName"
                            ></status-panel-exclude-object-dialog-list>
                        </v-col>
                    </v-row>
                </v-container>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelExcludeObjectDialogMap from '@/components/panels/StatusPanelExcludeObjectDialogMap.vue'
import StatusPanelExcludeObjectDialogList from '@/components/panels/StatusPanelExcludeObjectDialogList.vue'
import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {Panel, StatusPanelExcludeObjectDialogList, StatusPanelExcludeObjectDialogMap}
})
export default class StatusPanelExcludeObjectDialog extends Mixins(BaseMixin) {
    private hoverName = ''

    @Prop({ required: true }) readonly showDialog!: boolean
    @Prop({ required: true }) readonly excludeObjectDialogBool!: boolean
    @Prop({ required: true }) readonly excludeObjectDialogName!: string

    hideDialog() {
        this.$emit('update:showDialog', false )
    }

    get passName() {
        return this.excludeObjectDialogName
    }

    set passName(newVal: string) {
        this.$emit('update:name', newVal )
    }

    updateExcludeObjectDialogBool(newVal: boolean) {
        this.$emit('update:bool', newVal )
    }

    updateExcludeObjectDialogName(newVal: string) {
        this.$emit('update:name', newVal )
    }

    updateHoverObjectDialogName(newVal: string) {
        this.hoverName = newVal
    }
}
</script>