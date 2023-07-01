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
                <v-btn text color="primary" @click="update">{{ $t('App.TheServiceWorker.Update') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TheServiceWorker extends Mixins(BaseMixin) {
    showDialog = false
    updateSW: ((reloadPage?: boolean | undefined) => Promise<void>) | null = null

    onOfflineReady() {
        window.console.info('PWA is offline ready')
    }

    onNeedRefresh() {
        window.console.warn('PWA needs to refresh')
        this.showDialog = true
    }

    onRegistered() {
        window.console.debug('PWA is registered')
    }

    onRegisterError(error: any) {
        window.console.error('PWA registration error:', error)
    }

    update() {
        this.updateSW?.(true)
        this.showDialog = false
    }

    async mounted() {
        const { registerSW } = await import('virtual:pwa-register')
        this.updateSW = registerSW({
            immediate: true,
            onOfflineReady: this.onOfflineReady,
            onNeedRefresh: this.onNeedRefresh,
            onRegistered: this.onRegistered,
            onRegisterError: this.onRegisterError,
        })
    }
}
</script>
