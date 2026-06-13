<template>
    <div>
        <v-snackbar v-model="boolShowDialogRunning" :timeout="-1" location="bottom right">
            <div>{{ $t('Timelapse.TimelapseRendering') }}...</div>
            <v-progress-linear v-if="progress > 0" class="mt-2" :model-value="progress" indeterminate />
            <v-progress-linear v-if="progress === 0" class="mt-2" indeterminate />
        </v-snackbar>
        <v-snackbar v-model="boolShowDialogSuccess" :timeout="5000" location="bottom right">
            <div>
                {{ $t('Timelapse.TimelapseRenderingSuccessful') }}
                <br />
                <strong>{{ filename }}</strong>
            </div>
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const status = computed(() => store.state.server.timelapse.rendering.status ?? '')

const boolShowDialogRunning = computed(() => status.value === 'running')

const boolShowDialogSuccess = computed({
    get: () => status.value === 'success',
    set: (newVal: boolean) => {
        if (!newVal) store.dispatch('server/timelapse/resetSnackbar')
    },
})

const progress = computed(() => store.state.server.timelapse.rendering.progress ?? '')

const filename = computed(() => store.state.server.timelapse.rendering.filename ?? '')
</script>
