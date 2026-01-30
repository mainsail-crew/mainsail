<template>
  <div class="pa-4 rounded-lg elevation-1" style="background-color: #1e1d1df2; border: 1px solid #333232;">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-caption font-weight-medium text-uppercase" style="color: #a0a0a0;">
        Printer Status
      </h3>
      <div class="d-flex gap-1">
        <button
          v-for="s in statusList"
          :key="s"
          @click="setStatus(s)"
          :style="{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: status === s ? getStatusDotColor(s) : '#6b7280'
          }"
        />
      </div>
    </div>

    <!-- Main Status Display -->
    <div 
      class="mb-4 pa-4 rounded-lg d-flex align-center gap-4"
      :style="{ 
        backgroundColor: getStatusBackground(status),
        border: '1px solid #333232'
      }"
    >
      <div 
        class="rounded-lg d-flex align-center justify-center"
        style="width: 64px; height: 64px;"
        :style="{ backgroundColor: getStatusIconBackground(status) }"
      >
        <v-icon :color="getStatusColor(status)" size="32">
          {{ statusConfig[status].icon }}
        </v-icon>
      </div>
      <div>
        <h4 :style="{ color: getStatusColor(status) }" class="text-h5 font-weight-bold mb-1">
          {{ statusConfig[status].label }}
        </h4>
        <p style="color: #a0a0a0;" class="text-body-2">
          {{ statusMessage }}
        </p>
      </div>
    </div>

    <!-- Progress when printing -->
    <div v-if="status === 'printing'" class="mt-4 space-y-3">
      <div class="d-flex justify-space-between">
        <span style="color: #a0a0a0;" class="text-caption">Progress</span>
        <span style="color: #ffffff;" class="text-caption font-mono">{{ progress }}%</span>
      </div>
      <div class="h-2 rounded-full overflow-hidden" style="background-color: #333232;">
        <div 
          class="h-full rounded-full transition-all"
          style="background: linear-gradient(90deg, #3b82f6, #60a5fa);"
          :style="{ width: progress + '%' }"
        />
      </div>
      <div class="d-flex justify-space-between text-caption" style="color: #a0a0a0;">
        <span>Elapsed: {{ elapsedTime }}</span>
        <span>Remaining: ~{{ remainingTime }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="d-flex justify-space-between mb-4">
      <div 
        v-for="stat in stats" 
        :key="stat.label" 
        class="text-center pa-3 rounded-lg"
        style="background-color: #2a2929f2; border: 1px solid #333232; flex: 1; margin: 0 4px;"
      >
        <p style="color: #a0a0a0;" class="text-caption mb-1">{{ stat.label }}</p>
        <p style="color: #3b82f6;" class="text-h6 font-weight-bold font-mono">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Control Buttons - START/STOP (OPÇÃO 2 - GRID) -->
    <div class="buttons-container">
      <v-btn
        :style="{ 
          backgroundColor: status === 'printing' ? '#d97706' : '#059669',
          color: 'white'
        }"
        @click="togglePrint"
        :loading="loading"
        :disabled="status === 'error'"
        elevation="1"
        height="36"
        class="control-btn"
      >
        <v-icon left size="14">{{ status === 'printing' ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        {{ status === 'printing' ? 'PAUSE' : 'START' }}
      </v-btn>
      
      <v-btn
        :style="{ 
          backgroundColor: '#dc2626', 
          color: 'white'
        }"
        @click="stopPrint"
        :disabled="status === 'standby'"
        :loading="loading"
        elevation="1"
        height="36"
        class="control-btn"
      >
        <v-icon left size="14">mdi-stop</v-icon>
        STOP
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

type PrinterStatus = 'standby' | 'printing' | 'error' | 'paused'

@Component
export default class StatusPanel extends Vue {
  status: PrinterStatus = 'standby'
  progress = 26.9
  elapsedTime = '1h 23m'
  remainingTime = '3h 42m'
  loading = false

  statusList: PrinterStatus[] = ['standby', 'printing', 'paused', 'error']

  // CONFIG COM TODOS OS ESTADOS
  statusConfig = {
    standby: {
      label: 'Standby',
      icon: 'mdi-power',
    },
    printing: {
      label: 'Printing',
      icon: 'mdi-play',
    },
    paused: {
      label: 'Paused',
      icon: 'mdi-pause',
    },
    error: {
      label: 'Error',
      icon: 'mdi-alert',
    },
  }

  stats = [
    { label: 'Print Speed', value: '100%' },
    { label: 'Fan Speed', value: '75%' },
    { label: 'Flow Rate', value: '98%' }
  ]

  // MÉTODOS DE CORES
  getStatusColor(status: PrinterStatus): string {
    const colors = {
      standby: '#6b7280',      // Cinza
      printing: '#059669',     // Verde
      paused: '#d97706',       // Âmbar/Laranja
      error: '#dc2626'         // Vermelho
    }
    return colors[status]
  }

  getStatusDotColor(status: PrinterStatus): string {
    const colors = {
      standby: '#6b7280',      // Cinza
      printing: '#059669',     // Verde
      paused: '#d97706',       // Âmbar/Laranja
      error: '#dc2626'         // Vermelho
    }
    return colors[status]
  }

  getStatusBackground(status: PrinterStatus): string {
    const backgrounds = {
      standby: '#1e1d1df2',                    // Fundo escuro padrão
      printing: 'rgba(5, 150, 105, 0.15)',     // Verde transparente
      paused: 'rgba(217, 119, 6, 0.15)',       // Âmbar transparente
      error: 'rgba(220, 38, 38, 0.15)'         // Vermelho transparente
    }
    return backgrounds[status]
  }

  getStatusIconBackground(status: PrinterStatus): string {
    const iconBackgrounds = {
      standby: '#2a2929f2',                    // Um pouco mais claro
      printing: 'rgba(5, 150, 105, 0.25)',     // Verde mais opaco
      paused: 'rgba(217, 119, 6, 0.25)',       // Âmbar mais opaco
      error: 'rgba(220, 38, 38, 0.25)'         // Vermelho mais opaco
    }
    return iconBackgrounds[status]
  }

  get config() {
    return this.statusConfig[this.status]
  }

  get statusMessage() {
    switch (this.status) {
      case 'printing': return this.$store.state.printer?.print_stats?.filename || 'Layer 42 of 156'
      case 'standby': return 'Ready to print'
      case 'paused': return 'Print paused'
      case 'error': return 'Check filament'
      default: return ''
    }
  }

  // MÉTODO PARA MUDAR ESTADO (para testar os botões de status)
  setStatus(status: PrinterStatus) {
    this.status = status
    console.log('Status changed to:', status)
  }

  // MÉTODO PARA PAUSE/START
  async togglePrint() {
    this.loading = true
    try {
      if (this.status === 'printing') {
        this.status = 'paused'
        // await this.$socket.emit('printer.print.pause')
      } else {
        this.status = 'printing'
        // await this.$socket.emit('printer.print.resume')
      }
    } catch (error) {
      console.error('Error toggling print:', error)
    } finally {
      this.loading = false
    }
  }

  // MÉTODO PARA STOP
  async stopPrint() {
    this.loading = true
    try {
      // await this.$socket.emit('printer.print.stop')
      this.status = 'standby'
    } catch (error) {
      console.error('Error stopping print:', error)
    } finally {
      this.loading = false
    }
  }

  mounted() {
    this.updateFromPrinter()
    setInterval(() => {
      this.updateFromPrinter()
    }, 2000)
  }

  updateFromPrinter() {
    const printer = this.$store.state.printer
    
    if (!printer) return

    const state = printer.print_stats?.state
    switch (state) {
      case 'printing':
        this.status = 'printing'
        this.progress = Math.floor(this.$store.getters['printer/getPrintPercent'] * 100) || 0
        
        const printTime = printer.print_stats?.print_duration || 0
        this.elapsedTime = this.formatTime(printTime)
        
        if (this.progress > 0) {
          const totalEstimated = (printTime / this.progress) * 100
          const remaining = totalEstimated - printTime
          this.remainingTime = this.formatTime(remaining)
        }
        break
        
      case 'paused':
        this.status = 'paused'
        break
        
      case 'error':
        this.status = 'error'
        break
        
      default:
        this.status = 'standby'
    }

    if (printer.gcode_move) {
      this.stats[0].value = `${Math.round((printer.gcode_move.speed_factor || 1) * 100)}%`
      this.stats[1].value = `${Math.round((printer.fan?.speed || 0) * 100)}%`
      this.stats[2].value = `${Math.round((printer.gcode_move.extrude_factor || 1) * 100)}%`
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }
}
</script>

<style scoped>
/* Apenas classes de utilidade */
.d-flex { display: flex; }
.align-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-space-between { justify-content: space-between; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-1 { gap: 4px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.pa-4 { padding: 16px; }
.pa-3 { padding: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.text-h5 { font-size: 1.5rem; line-height: 2rem; }
.text-h6 { font-size: 1.125rem; line-height: 1.75rem; }
.text-caption { font-size: 0.75rem; line-height: 1rem; }
.text-body-2 { font-size: 0.875rem; line-height: 1.25rem; }
.font-weight-bold { font-weight: 700; }
.font-weight-medium { font-weight: 500; }
.font-mono { font-family: 'Roboto Mono', monospace; }
.uppercase { text-transform: uppercase; }
.overflow-hidden { overflow: hidden; }
.transition-all { transition: all 0.3s ease; }
.h-2 { height: 8px; }
.text-center { text-align: center; }
.block { display: block; }
.elevation-1 { box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); }

/* OPÇÃO 2 - GRID PARA BOTÕES */
.buttons-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* 2 colunas iguais */
  gap: 8px; /* Espaçamento menor */
  margin-top: 16px;
}

.control-btn {
  min-width: 0; /* Permite que encolham */
  font-size: 0.75rem; /* Texto menor */
  padding: 0 8px; /* Padding lateral menor */
  white-space: nowrap; /* Evita quebra de texto */
}
</style>