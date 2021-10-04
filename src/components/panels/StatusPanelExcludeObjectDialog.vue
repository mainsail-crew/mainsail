<style lang="scss" scoped>

</style>

<template>
    <div>
        <v-dialog v-model="showDialog" width="900" persistent :fullscreen="isMobile">
            <v-card style="overflow: hidden;">
                <v-toolbar flat dense>
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-selection-remove</v-icon>{{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObject') }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0 px-2" color="grey darken-2" @click="hideDialog"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-container>
                    <v-row>
                        <v-col class="col-6">
                            <status-panel-exclude-object-dialog-map
                                :hover-name="hoverName"
                                @update:name="updateExcludeObjectDialogName"
                                @update:bool="updateExcludeObjectDialogBool"
                            ></status-panel-exclude-object-dialog-map>
                        </v-col>
                        <v-col class="col-6">
                            <status-panel-exclude-object-dialog-list
                                :exclude-object-dialog-name.sync="excludeObjectDialogName"
                                @update:name="updateExcludeObjectDialogName"
                                @update:hoverName="updateHoverObjectDialogName"
                                :exclude-object-dialog-bool.sync="excludeObjectDialogBool"
                                @update:bool="updateExcludeObjectDialogBool"
                            ></status-panel-exclude-object-dialog-list>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelExcludeObjectDialogMap from '@/components/panels/StatusPanelExcludeObjectDialogMap.vue'
import StatusPanelExcludeObjectDialogList from '@/components/panels/StatusPanelExcludeObjectDialogList.vue'
@Component({
    components: {StatusPanelExcludeObjectDialogList, StatusPanelExcludeObjectDialogMap}
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