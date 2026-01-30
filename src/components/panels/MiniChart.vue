<template>
  <div class="mini-chart">
    <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="`grad-${gradientId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        :stroke="color"
        stroke-width="2"
        :points="chartPoints"
        vector-effect="non-scaling-stroke"
      />
      <polygon
        :fill="`url(#grad-${gradientId})`"
        :points="`0,100 ${chartPoints} 100,100`"
      />
    </svg>
    <div 
      class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse"
      :style="{ backgroundColor: color }"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class MiniChart extends Vue {
  @Prop({ type: Array, required: true }) readonly data!: number[]
  @Prop({ type: String, required: true }) readonly color!: string

  get gradientId(): string {
    return `grad-${this.color.replace(/[^a-zA-Z0-9]/g, '')}`
  }

  get chartPoints(): string {
    const max = Math.max(...this.data, 1)
    const min = Math.min(...this.data, 0)
    const range = max - min || 1
    
    return this.data.map((val, i) => {
      const x = (i / (this.data.length - 1)) * 100
      const y = 100 - ((val - min) / range) * 100
      return `${x},${y}`
    }).join(' ')
  }
}
</script>

<style scoped>
.mini-chart {
  position: relative;
  height: 48px;
  width: 100%;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>