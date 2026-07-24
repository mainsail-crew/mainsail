<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="config.icon"
        :title="config.title"
        :collapsible="config.collapsible"
        :loading="!loadedComponent"
        card-class="custom-panel">
        <component
            :is="loadedComponent"
            v-if="loadedComponent"
            :panel-config="config"
            :panel-store="$store"
            :panel-socket="$socket"
        />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import { ConfigJsonCustomPanel } from '@/store/types'
@Component({
    components: { Panel },
})
export default class CustomPanel extends Mixins(BaseMixin) {
    @Prop({ required: true, type: Object })
    readonly config: ConfigJsonCustomPanel;

    loadedComponent: null|object = null;
    async created() {
        await this.resolvePlugin();
    }

    private async resolvePlugin() {
        try {
            if (this.config.entryUrl) {
                // Fetch the external ESM package at runtime
                const module = await import(/* @vite-ignore */ this.config.entryUrl);
                this.loadedComponent = module.default;
            }
        } catch (error) {
            window.console.error(`Failed to load custom panel: ${this.config.title}`, error);
        }
    }
}
</script>
