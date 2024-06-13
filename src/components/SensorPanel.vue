<template>
  <panel
    :icon="mdiDipSwitch"
    :title="$t('Panels.SensorPanel.Headline')"
    :collapsible="true"
    card-class="sensor-panel">
    <div v-if="isDataAvailable">
      <v-card class="py-2">
        <div v-if="sensorData">
          <div class="table-container">
            <h2 class="sensor-title" v-html="sensorData.title"></h2>
            <table class="sensor-table">
              <thead>
                <tr>
                  <th v-for="header in sensorData.headers" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in sensorData.rows" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="sensor-footer" v-html="sensorData.footer"></div>
        </div>
        <div ref="chart" class="chart"></div>
        <div v-else>
          <p>No Sensor Data Found...</p>
        </div>
      </v-card>
    </div>
  </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mapState, mapActions } from 'vuex'
import { mdiDipSwitch } from '@mdi/js'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts } from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared.d'

echarts.use([TitleComponent, TooltipComponent, GridComponent, LineChart, CanvasRenderer])

@Component({
  components: { Panel },
  computed: {
    ...mapState({
      sensorData: (state: any) => state.sensorData ?? null
    }),
    isDataAvailable() {
      return this.sensorData !== null
    }
  },
  methods: {
    ...mapActions(['fetchSensorData'])
  }
})
export default class SensorPanel extends Mixins(BaseMixin) {
  mdiDipSwitch = mdiDipSwitch
  sensorData: SensorData | null = null
  interval: number | undefined = undefined
  chart: ECharts | null = null

  created() {
    this.fetchSensorData()
    this.interval = window.setInterval(this.fetchSensorData, 500)
  }

  mounted() {
    this.initializeChart()
  }

  updated() {
    this.initializeChart()
  }

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.chart) {
      this.chart.dispose()
    }
  }

  initializeChart() {
    if (this.isDataAvailable && this.$refs.chart) {
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart as HTMLElement)
        this.chart.setOption(this.chartOptions)
      }
    }
  }

  async fetchSensorData() {
    try {
      const url = `http://${window.location.hostname}:5000/sensor`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data: SensorData = await response.json()
        this.sensorData = data
        this.updateChart(data.chart_data)
      } else {
        console.error('Error fetching sensor data:', response.statusText)
        this.sensorData = null
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
      this.sensorData = null
    }
  }

  updateChart(sensorValue: number) {
    if (this.chart) {
      const timestamp = new Date()
      const options = this.chart.getOption()

      options.xAxis[0].data.push(timestamp)
      options.series[0].data.push([timestamp, sensorValue])

      if (options.xAxis[0].data.length > 1500) {
        options.xAxis[0].data.shift()
        options.series[0].data.shift()
      }

      this.chart.setOption(options)
    }
  }

  get chartOptions(): ECBasicOption {
    return {
      renderer: 'svg',
      animation: false,
      grid: {
        top: 35,
        right: 20,
        bottom: 40,
        left: 70
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => param.marker + ' ' + param.seriesName + ': ' + param.data[1]).join('<br/>')
        }
      },
      xAxis: {
        type: 'time',
        splitNumber: 5,
        minInterval: 120 * 1000,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#fff',
            opacity: '0.1'
          }
        },
        axisLabel: {
          color: '#ccc',
          formatter: (value: number) => {
            const date = new Date(value)
            return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0')
          }
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        data: []
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '10%'],
        scale: true,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#fff',
            opacity: '0.1'
          }
        },
        axisLabel: {
          color: '#ccc'
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        }
      },
      series: [
        {
          name: 'Sensor Value',
          type: 'line',
          data: []
        }
      ]
    }
  }
  get isDataAvailable() {
    return this.sensorData !== null
  }
}
</script>

<style scoped>
.sensor-title {
  margin: 10px;
  text-align: center;
  font-size: 24px;
}
.table-container {
  overflow-x: auto;
}
.sensor-table {
  width: 100%;
  border-collapse: collapse;
}
td {
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  padding: 10px;
  text-align: center;
  color: #ccc;
  font-size: 0.875rem;
}
th {
  border-top: none;
  border-bottom: 1px solid #444;
  padding: 10px;
  text-align: center;
  color: #ccc;
  font-size: 0.75rem;
}
.sensor-footer {
  text-align: center;
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
}
.chart {
  width: 100%;
  height: 400px;
}
@media (max-width: 768px) {
  .sensor-table th,
  .sensor-table td {
    font-size: 12px;
    padding: 5px;
  }
  .status-row {
    font-size: 20px;
  }
  .chart {
    height: 300px;
  }
}
@media (max-width: 480px) {
  .sensor-table th,
  .sensor-table td {
    font-size: 10px;
  }
  .status-row {
    font-size: 18px;
  }
  .chart {
    height: 200px;
  }
}
</style>