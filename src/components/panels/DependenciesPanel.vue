<template>
    <panel
        v-if="socketIsConnected && dependencies.length"
        icon="mdi-alert-circle"
        :title="$tc('Panels.DependenciesPanel.Dependency', dependencies.length) + ' ('+dependencies.length+')'"
        :collapsible="true"
        card-class="dependencies-panel"
        toolbar-color="orange darken-2"
        >
        <v-card-text :class="index > 0 ? 'py-0' : 'pt-3 pb-0'" v-for="(dependency, index) in dependencies" v-bind:key="index">
            <v-divider class="my-2" v-if="index"></v-divider>
            <v-row>
                <v-col>
                    <p class="mb-0 orange--text">
                        {{ $t('Panels.DependenciesPanel.DependencyDescription', { name: dependency.serviceName, installedVersion: dependency.installedVersion, neededVersion: dependency.neededVersion }) }}
                    </p>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions></v-card-actions>
    </panel>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {Panel}
})
export default class DependenciesPanel extends Mixins(BaseMixin) {

    get dependencies() {
        return this.$store.getters['getDependencies'] ?? []
    }
}
</script>