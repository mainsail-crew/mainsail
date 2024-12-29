<template>
    <div class="tool-container">
        <afc-extruder-tools-item
            v-for="(tool, toolName) in tools"
            :key="toolName"
            :tool="tool"
            :tool-name="toolName"
            class="tool-card rounded-lg shadow-md" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcExtruderToolsItem from '@/components/panels/Afc/AfcExtruderToolsItem.vue'
import { Extruder } from '@/store/server/afc/types'

@Component({
    components: { AfcExtruderToolsItem },
})
export default class AfcExtruderTools extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly tools!: Extruder[]
}
</script>

<style scoped>
.tool-card {
    transition: background-color 0.3s ease;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-content: center;
    justify-content: space-between;
}

.theme--dark .tool-card {
    background-color: #2e2e2e;
}

.theme--light .tool-card {
    background-color: #ebebeb;
}

.tool-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    padding-top: 0px;
    margin-top: 0px;
}
</style>
