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
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

import Panel from '@/components/ui/Panel.vue'
import { mdiLockOutline } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class PageHeightmap extends Mixins(BaseMixin) {
    mdiLockOutline = mdiLockOutline
}
</script>
