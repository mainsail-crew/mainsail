<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.SpoolmanTab.WebURL')">
                    <v-text-field v-model="spoolmanUrl" hide-details outlined dense></v-text-field>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class SettingsSpoolmanTab extends Mixins(BaseMixin) {
    availableLanguages: { text: string; value: string }[] = []

    async created() {
        const locales = import.meta.glob<string>('../../locales/*.json', { import: 'title' })
        const languages: { text: string; value: string }[] = []

        for (const file in locales) {
            const langKey = file.slice(file.lastIndexOf('.') - 2, file.lastIndexOf('.'))
            const title = await locales[file]()

            languages.push({
                text: title,
                value: langKey,
            })
        }

        this.availableLanguages = languages
    }

    get spoolmanUrl() {
        return this.$store.state.gui.general.spoolmanUrl
    }

    set spoolmanUrl(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.spoolmanUrl', value: newVal })
    }
}
</script>
