<template>
    <div>
        <!-- APENAS Status Panel e Temperature Panel -->
        <v-row>
            <v-col cols="12">
                <status-panel />
            </v-col>
        </v-row>
        
        <v-row class="mt-3">
            <v-col cols="12" md="6">
                <temperature-panel />
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from '@/components/mixins/dashboard'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'

@Component({
    components: {
        StatusPanel,
        TemperaturePanel
        // REMOVI TODOS OS OUTROS
    },
})
export default class PageDashboard extends Mixins(DashboardMixin) {
    mounted() {
        console.log('Dashboard mounted - Clean version with only Status and Temperature')
    }
    
    // Removi todas as propriedades getter dos layouts
    // pois não estamos mais a usar o sistema de painéis dinâmicos
}
</script>