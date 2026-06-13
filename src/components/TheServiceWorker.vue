<template>
    <v-dialog v-model="showDialog" persistent max-width="400" class="mx-0">
        <panel
            :title="$t('App.TheServiceWorker.TitleNeedUpdate')"
            card-class="service-worker-dialog"
            :margin-bottom="false">
            <v-card-text>
                <p>{{ $t('App.TheServiceWorker.DescriptionNeedUpdate') }}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
 <v-btn variant="text" color="primary" @click="update">{{ $t('App.TheServiceWorker.Update') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showDialog = ref(false)
let updateSW: ((reloadPage?: boolean | undefined) => Promise<void>) | null = null

function onOfflineReady() {
    window.console.info('PWA is offline ready')
}

function onNeedRefresh() {
    window.console.warn('PWA needs to refresh')
    showDialog.value = true
}

function onRegistered() {
    window.console.debug('PWA is registered')
}

function onRegisterError(error: Error) {
    window.console.error('PWA registration error:', error)
}

function update() {
    updateSW?.(true)
    showDialog.value = false
}

onMounted(async () => {
    const { registerSW } = await import('virtual:pwa-register')
    updateSW = registerSW({
        immediate: true,
        onOfflineReady: onOfflineReady,
        onNeedRefresh: onNeedRefresh,
        onRegistered: onRegistered,
        onRegisterError: onRegisterError,
    })
})
</script>
