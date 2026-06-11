<template>
    <div>
        <v-row>
            <template v-if="klipperReadyForGui">
                <v-col class="col-12 col-md-8 pb-0">
                    <heightmap-chart-panel />
                </v-col>
                <v-col class="col-12 col-md-4">
                    <heightmap-current-profile-panel />
                    <heightmap-profiles-panel />
                </v-col>
            </template>
            <template v-else>
                <v-col>
                    <v-alert
                        dense
                        text
                        type="warning"
                        elevation="2"
                        class="mx-auto mt-6"
                        max-width="500"
                        :icon="mdiLockOutline">
                        {{ $t('Heightmap.ErrorKlipperNotReady') }}
                    </v-alert>
                </v-col>
            </template>
        </v-row>
    </div>
</template>
<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import { mdiLockOutline } from '@mdi/js'

const { klipperReadyForGui } = useBase()
</script>
