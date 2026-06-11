<template>
    <v-menu offset-y left :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
        <template #activator="{ on, attrs }">
            <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on">
                <v-icon>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-row>
                    <v-col class="pr-0">{{ $t('Files.HiddenFiles') }}</v-col>
                    <v-col class="col-auto pl-0">
                        <v-icon
                            :color="showHiddenFiles ? 'primary' : 'grey lighten-1'"
                            @click.stop="toggleHiddenFiles">
                            {{ showHiddenFiles ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-row>
                    <v-col class="pr-0">{{ $t('Files.RunFiles') }}</v-col>
                    <v-col class="col-auto pl-0">
                        <v-icon
                            :color="showCompletedFiles ? 'primary' : 'grey lighten-1'"
                            @click.stop="toggleCompletedFiles">
                            {{ showCompletedFiles ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { useGcodeFiles } from '@/composables/useGcodeFiles'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiCog } from '@mdi/js'

const { showHiddenFiles, setShowHiddenFiles, showCompletedFiles, setShowCompletedFiles } = useGcodeFiles()

function toggleHiddenFiles() {
    setShowHiddenFiles(!showHiddenFiles.value)
}

function toggleCompletedFiles() {
    setShowCompletedFiles(!showCompletedFiles.value)
}
</script>
