<template>
    <v-snackbar :value="activeTypes.length > 0" :timeout="-1" fixed right bottom>
        <editor-transfer-snackbar-item
            v-for="(type, index) in activeTypes"
            :key="type"
            :type="type"
            :class="{ 'mt-3': index > 0 }" />
    </v-snackbar>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import EditorTransferSnackbarItem from '@/components/editor/EditorTransferSnackbarItem.vue'
import type { EditorRequestType } from '@/store/editor/types'

const REQUEST_TYPES: EditorRequestType[] = ['download', 'upload']

@Component({ components: { EditorTransferSnackbarItem } })
export default class TheEditorTransferSnackbar extends Mixins(BaseMixin) {
    get activeTypes(): EditorRequestType[] {
        return REQUEST_TYPES.filter((type) => this.$store.state.editor.loaders[type].isLoading)
    }
}
</script>
