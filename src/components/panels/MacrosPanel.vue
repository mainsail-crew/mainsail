<template>
    <panel
        v-if="klipperReadyForGui && macros.length > 0"
        icon="mdi-code-tags"
        :title="$t('Panels.MacrosPanel.Headline')"
        :collapsible="true"
        card-class="macros-panel"
    >
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <macro-button v-for="(macro, index) in macros"
                                  :key="'macro_'+index"
                                  :macro="macro"
                                  color="primary"
                                  class="mx-1 my-1"
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import MacroButton from '@/components/inputs/MacroButton.vue'
@Component({
    components: {MacroButton, Panel}
})
export default class MacrosPanel extends Mixins(BaseMixin) {
    get macros() {
        return this.$store.getters['printer/getMacros']
    }
}
</script>
