<template>
  <panel
    :icon="mdiDipSwitch"
    :title="$t('Panels.SensorPanel.Headline')"
    :collapsible="true"
    card-class="sensor-panel">
    <v-card-text class="py-2">
      <div v-if="sensorData">
        <div class="table-container">
          <table class="sensor-table">
            <thead>
              <tr>
                <th></th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Air Quality</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ambient</td>
                <td>{{ sensorData.ambient_temp.toFixed(2) }}°C</td>
                <td>{{ sensorData.ambient_hum.toFixed(2) }}%</td>
                <td>{{ sensorData.ambient_aqi.toFixed(2) }}</td>
              </tr>
              <tr>
                <td>Chamber</td>
                <td>{{ sensorData.chamber_temp.toFixed(2) }}°C</td>
                <td>{{ sensorData.chamber_hum.toFixed(2) }}%</td>
                <td>{{ sensorData.chamber_aqi.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      <div class="status-row" :class="statusClass">
        <h2>Status: {{ airQualityStatus }}</h2>
      </div>
    </div>
      <div v-else>
        <p>Loading sensor data...</p>
      </div>
    </v-card-text>
  </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mapState, mapActions } from 'vuex';
import { mdiDipSwitch } from '@mdi/js'
@Component({
    components: { Panel},
    computed: {
    ...mapState({
      sensorData: (state: any) => state.sensorData ?? null
    })
  },
  methods: {
    ...mapActions(['fetchSensorData'])
  }
})
export default class SensorPanel extends Mixins(BaseMixin) {
  mdiDipSwitch = mdiDipSwitch

 sensorData: SensorData | null = null
  interval: number | undefined = undefined

  get airQualityStatus(): string {
    if (!this.sensorData) return ''
    return this.sensorData.status
  }

  get statusClass(): string {
    if (!this.sensorData) return ''
    switch (this.sensorData.status) {
      case 'GOOD':
        return 'status-good'
      case 'MODERATE':
        return 'status-moderate'
      case 'BAD':
        return 'status-bad'
      default:
        return ''
    }
  }

  created() {
    this.fetchSensorData()
    this.interval = window.setInterval(this.fetchSensorData, 500) // Adjust the interval as needed
  }

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  async fetchSensorData() {
    try {
      const url = 'http://' + window.location.hostname + ':5000/sensor'

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data: SensorData = await response.json()
        this.sensorData = data
      } else {
        console.error('Error fetching sensor data:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
    }
  }
};
</script>

<style scoped>
h2 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
}
.table-container {
  overflow-x: auto;
}
.sensor-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
th, td {
  border: 1px solid #444; 
  padding: 10px;
  text-align: center;
  color: #ccc; 
}
thead {
  background-color: #2d2d2d; 
}
.status-row {
  text-align: center;
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
}
.status-good {
  color: #4caf50; /* Green */
}
.status-moderate {
  color: #ff9800; /* Orange */
}
.status-bad {
  color: #f44336; /* Red */
}
@media (max-width: 480px) {
  .sensor-table {
    font-size: 10px;
  }
  .status-row {
    font-size: 18px;
  }
}
</style>