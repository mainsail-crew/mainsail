<template>
  <div class="blocks-panel rounded-xl p-5">
    <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
      Temperature Control
    </h3>
    
    <div class="space-y-4">
      <!-- Hotend -->
      <div class="p-4 rounded-lg bg-blocks-surface">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-orange-500/10">
              <v-icon class="w-4 h-4 text-orange-500" small>mdi-fire</v-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">Hotend</p>
              <p class="text-xs text-muted-foreground">Nozzle Temperature</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-mono font-bold text-foreground">
              {{ hotend.current.toFixed(0) }}
              <span class="text-sm text-muted-foreground">°C</span>
            </p>
            <p class="text-xs text-muted-foreground">
              Target: <span class="text-orange-500 font-mono">{{ hotend.target }}°C</span>
            </p>
          </div>
        </div>
        
        <!-- Simple progress bar instead of chart for now -->
        <div class="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-500 bg-orange-500"
            :style="{ width: `${Math.min((hotend.current / hotend.target) * 100, 100)}%` }"
          />
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{{ hotend.current.toFixed(1) }}°C</span>
          <span>{{ hotend.target }}°C</span>
        </div>
      </div>

      <!-- Bed -->
      <div class="p-4 rounded-lg bg-blocks-surface">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-primary/10">
              <v-icon class="w-4 h-4 text-primary" small>mdi-radiator</v-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">Heated Bed</p>
              <p class="text-xs text-muted-foreground">Build Plate</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-mono font-bold text-foreground">
              {{ bed.current.toFixed(0) }}
              <span class="text-sm text-muted-foreground">°C</span>
            </p>
            <p class="text-xs text-muted-foreground">
              Target: <span class="text-primary font-mono">{{ bed.target }}°C</span>
            </p>
          </div>
        </div>
        
        <!-- Simple progress bar instead of chart for now -->
        <div class="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-500 bg-primary"
            :style="{ width: `${Math.min((bed.current / bed.target) * 100, 100)}%` }"
          />
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{{ bed.current.toFixed(1) }}°C</span>
          <span>{{ bed.target }}°C</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

interface TempData {
  current: number
  target: number
}

@Component
export default class TemperaturePanel extends Vue {
  hotend: TempData = {
    current: 215,
    target: 220
  }
  
  bed: TempData = {
    current: 58,
    target: 60
  }

  intervalId: number | null = null

  mounted() {
    this.updateFromPrinter()
    this.intervalId = setInterval(() => {
      this.updateFromPrinter()
    }, 2000)
  }

  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  updateFromPrinter() {
    const printer = this.$store.state.printer
    
    if (printer) {
      // Atualizar do estado real da impressora
      if (printer.extruder) {
        this.hotend.current = printer.extruder.temperature || 0
        this.hotend.target = printer.extruder.target || 0
      }
      
      if (printer.heater_bed) {
        this.bed.current = printer.heater_bed.temperature || 0
        this.bed.target = printer.heater_bed.target || 0
      }
    } else {
      // Dados simulados (apenas para demo)
      this.hotend.current = this.hotend.target + (Math.random() - 0.5) * 4
      this.bed.current = this.bed.target + (Math.random() - 0.5) * 2
    }
  }
}
</script>

<style scoped>
/* Classes Tailwind para os temas */
.text-muted-foreground {
  color: #6b7280 !important;
}

.text-foreground {
  color: #111827 !important;
}

.bg-blocks-surface {
  background-color: #1e1d1d;
  border: 1px solid #e5e7eb !important;
}

.bg-orange-500\/10 {
  background-color: rgba(249, 115, 22, 0.1) !important;
}

.bg-primary\/10 {
  background-color: rgba(59, 130, 246, 0.1) !important;
}

.text-orange-500 {
  color: #f97316 !important;
}

.text-primary {
  color: #3b82f6 !important;
}

.bg-orange-500 {
  background-color: #f97316 !important;
}

.bg-primary {
  background-color: #3b82f6 !important;
}

.bg-muted {
  background-color: #1e1d1df2;
}

/* Layout */
.blocks-panel {
  background-color: #1e1d1df2;
  border: 1px solid #e5e7eb;
}

.rounded-xl {
  border-radius: 0.75rem;
}

/* Flex utilities */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

/* Spacing */
.p-5 {
  padding: 1.25rem;
}

.p-4 {
  padding: 1rem;
}

.p-2 {
  padding: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

/* Typography */
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Borders */
.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

/* Overflow */
.overflow-hidden {
  overflow: hidden;
}

/* Sizing */
.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.h-1\.5 {
  height: 0.375rem;
}

/* Transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-500 {
  transition-duration: 500ms;
}
</style>