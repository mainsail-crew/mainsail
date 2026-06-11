<template>
    <v-dialog :model-value="showDialog" @update:model-value="emitValue" persistent max-width="600">
        <panel
            :title="$t('Machine.UpdatePanel.AreYouSure')"
            :icon="mdiProgressQuestion"
            :margin-bottom="false"
            card-class="machine-update-hint-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <update-hint-alert :repo="repo" @open-commit-history="openCommitHistory" />
                        <div>
                            <v-checkbox
                                v-model="checkboxUpdateQuestion"
                                :label="$t('Machine.UpdatePanel.IUnderstandTheRisks')"
                                hide-details />
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Machine.UpdatePanel.Abort') }}</v-btn>
                <v-btn text color="primary" :disabled="!checkboxUpdateQuestion" @click="doUpdate">
                    {{ $t('Machine.UpdatePanel.StartUpdate') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ServerUpdateManagerStateGitRepo } from '@/store/server/updateManager/types'
import { mdiProgressQuestion, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import UpdateHintAlert from '@/components/panels/Machine/UpdatePanel/UpdateHintAlert.vue'

const props = defineProps<{
    'model-value': boolean
    repo: ServerUpdateManagerStateGitRepo
}>()

const emit = defineEmits<{
    'update:model-value': [value: boolean]
    'do-update': []
    'open-commit-history': []
}>()

const checkboxUpdateQuestion = ref(false)

const showDialog = computed(() => props['model-value'])

function emitValue(val: boolean) {
    emit('update:model-value', val)
}

function doUpdate() {
    emit('do-update')
}

function openCommitHistory() {
    emit('open-commit-history')
}

function closeDialog() {
    emit('update:model-value', false)
}
</script>
