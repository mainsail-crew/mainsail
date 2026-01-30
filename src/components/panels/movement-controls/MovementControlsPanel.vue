<template>
  <v-card class="pa-3" :height="height">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-xs font-weight-medium text--secondary text-uppercase tracking-wider">
        {{ $t('Panels.MovementControls.Title') }}
      </h3>
      <v-btn
        variant="text"
        size="small"
        class="text-caption gap-1"
        @click="homeAll"
        :loading="loading"
      >
        <v-icon size="12">mdi-home</v-icon>
        {{ $t('Panels.MovementControls.Home') }}
      </v-btn>
    </div>

    <!-- Step Size Selector -->
    <div class="d-flex align-center gap-2 mb-3">
      <span class="text-caption text--secondary">{{ $t('Panels.MovementControls.Step') }}:</span>
      <v-btn-toggle
        v-model="stepSize"
        dense
        mandatory
        class="ml-2"
      >
        <v-btn
          v-for="size in stepSizes"
          :key="size"
          :value="size"
          size="x-small"
          class="px-2"
          :class="{ 'v-btn--active': stepSize === size }"
        >
          {{ size }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Movement Grid -->
    <div class="movement-grid">
      <!-- Row 1: Y+ -->
      <div class="grid-row">
        <div class="grid-cell"></div>
        <div class="grid-cell">
          <v-btn
            icon
            size="small"
            @click="moveAxis('y', 1)"
            :disabled="!klipperReady"
          >
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
        </div>
        <div class="grid-cell"></div>
      </div>

      <!-- Row 2: X-, Z, X+ -->
      <div class="grid-row">
        <div class="grid-cell">
          <v-btn
            icon
            size="small"
            @click="moveAxis('x', -1)"
            :disabled="!klipperReady"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>
        
        <div class="grid-cell">
          <v-btn
            icon
            size="small"
            @click="moveAxis('z', 1)"
            :disabled="!klipperReady"
            class="z-axis-btn"
          >
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
          <div class="text-center text-caption mt-1">Z</div>
        </div>
        
        <div class="grid-cell">
          <v-btn
            icon
            size="small"
            @click="moveAxis('x', 1)"
            :disabled="!klipperReady"
          >
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Row 3: Y- -->
      <div class="grid-row">
        <div class="grid-cell"></div>
        <div class="grid-cell">
          <v-btn
            icon
            size="small"
            @click="moveAxis('y', -1)"
            :disabled="!klipperReady"
          >
            <v-icon>mdi-arrow-down</v-icon>
          </v-btn>
        </div>
        <div class="grid-cell"></div>
      </div>
    </div>

    <!-- Position Display -->
    <div v-if="showPosition" class="mt-3 pt-2 border-top">
      <div class="d-flex justify-space-between text-caption">
        <span class="d-flex align-center">
          <v-icon x-small class="mr-1">mdi-axis-x-arrow</v-icon>
          {{ currentPosition.x.toFixed(1) }}
        </span>
        <span class="d-flex align-center">
          <v-icon x-small class="mr-1">mdi-axis-y-arrow</v-icon>
          {{ currentPosition.y.toFixed(1) }}
        </span>
        <span class="d-flex align-center">
          <v-icon x-small class="mr-1">mdi-axis-z-arrow</v-icon>
          {{ currentPosition.z.toFixed(1) }}
        </span>
      </div>
    </div>

    <!-- E-stop Button -->
    <div class="mt-3">
      <v-btn
        block
        color="error"
        size="small"
        @click="emergencyStop"
        :disabled="!klipperReady"
        :loading="loading"
      >
        <v-icon left size="16">mdi-alert-octagon</v-icon>
        {{ $t('Panels.MovementControls.EmergencyStop') }}
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component
export default class MovementControlsPanel extends Vue {
  @Prop({ type: String, default: null }) readonly panelId!: string | null
  @Prop({ type: String, default: '100%' }) readonly height!: string

  stepSizes = [0.1, 1, 10, 100]
  stepSize = 10
  loading = false
  
  currentPosition = {
    x: 0,
    y: 0,
    z: 0
  }

  get printer() {
    return this.$store.state.printer
  }

  get klipperReady() {
    return this.printer?.print_stats?.state === 'ready' || 
           this.printer?.print_stats?.state === 'standby'
  }

  get showPosition() {
    return this.printer?.toolhead?.position !== undefined
  }

  @Watch('printer.toolhead.position', { deep: true })
  onPositionChange() {
    this.updatePositionFromPrinter()
  }

  mounted() {
    this.updatePositionFromPrinter()
  }

  updatePositionFromPrinter() {
    const toolhead = this.printer.toolhead
    if (toolhead?.position) {
      this.currentPosition = {
        x: toolhead.position[0] || 0,
        y: toolhead.position[1] || 0,
        z: toolhead.position[2] || 0
      }
    }
  }

  async moveAxis(axis: 'x' | 'y' | 'z', direction: number) {
    if (!this.klipperReady) return
    
    this.loading = true
    const distance = this.stepSize * direction
    const gcode = `G91\nG1 ${axis.toUpperCase()}${distance} F6000\nG90`
    
    try {
      await this.$store.dispatch('server/addEvent', {
        message: `Moving ${axis.toUpperCase()} ${direction > 0 ? '+' : '-'}${Math.abs(distance)}mm`,
        type: 'command'
      })
      
      this.$socket.emit('printer.gcode.script', { script: gcode })
    } catch (error) {
      console.error('Error moving axis:', error)
    } finally {
      this.loading = false
    }
  }

  async homeAll() {
    if (!this.klipperReady) return
    
    this.loading = true
    try {
      await this.$store.dispatch('server/addEvent', {
        message: 'Homing all axes',
        type: 'command'
      })
      
      this.$socket.emit('printer.gcode.script', { script: 'G28' })
    } catch (error) {
      console.error('Error homing:', error)
    } finally {
      this.loading = false
    }
  }

  async emergencyStop() {
    this.loading = true
    try {
      await this.$store.dispatch('server/addEvent', {
        message: 'Emergency stop triggered',
        type: 'warning'
      })
      
      this.$socket.emit('printer.emergency_stop')
    } catch (error) {
      console.error('Error emergency stop:', error)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.movement-grid {
  display: grid;
  grid-template-rows: repeat(3, auto);
  gap: 12px;
  justify-content: center;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(3, 50px);
  gap: 12px;
  justify-items: center;
  align-items: center;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.z-axis-btn {
  margin-bottom: 4px;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
.theme--dark .border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
</style>