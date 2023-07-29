<template>
    <settings-row :title="$t('Settings.PresetsTab.Cooldown')">
        <v-btn small outlined class="ml-3" @click="editCooldown">
            <v-icon left small>{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPencil } from '@mdi/js'

@Component({
    components: { SettingsRow },
})
export default class PresetsEntryCooldown extends Mixins(BaseMixin) {
    mdiPencil = mdiPencil

    editCooldown() {
        this.$emit('edit')
    }
}
</script>
