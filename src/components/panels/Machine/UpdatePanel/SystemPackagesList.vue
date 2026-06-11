<template>
    <v-dialog :model-value="showDialog" @update:model-value="emitValue" persistent max-width="800">
        <panel
            :title="$t('Machine.UpdatePanel.UpgradeableSystemPackages')"
            :icon="mdiPackageVariantClosed"
            :margin-bottom="false"
            card-class="machine-update-system-packages-list-dialog">
            <template #buttons>
                <v-btn icon @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p>{{ $t('Machine.UpdatePanel.ThesePackagesCanBeUpgrade') }}</p>
                        <p class="system-packages-list">{{ packagesList.join(', ') }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" color="primary" @click="closeDialog">{{ $t('Buttons.Close') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mdiCloseThick, mdiPackageVariantClosed } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'

const props = defineProps<{
    'model-value': boolean
    packagesList: string[]
}>()

const emit = defineEmits<{
    'update:model-value': [value: boolean]
}>()


const showDialog = computed(() => props['model-value'])

function emitValue(val: boolean) {
    emit('update:model-value', val)
}

function closeDialog() {
    emit('update:model-value', false)
}
</script>

<style scoped>
.system-packages-list {
    font-family: monospace;
    margin-bottom: 0 !important;
}
</style>
