<template>
    <v-menu
        v-model="boolMenu"
        bottom
        :left="!isMobile"
        offset-y
        :close-on-click="true"
        :close-on-content-click="false"
        origin="center center"
        transition="slide-y-transition"
        :min-width="isMobile ? '100%' : null">
        <template #activator="{ props }">
            <v-btn :icon="boolMenu ? mdiBell : mdiBellOutline" rounded="0" class="minwidth-0" v-bind="props">
                <v-badge
                    :content="notifications.length <= 9 ? notifications.length : '9+'"
                    :value="notifications.length > 0"
                    :color="colorBadge"
                    overlap />
            </v-btn>
        </template>
        <v-card flat :min-width="300" :max-width="isMobile ? null : 400">
            <template v-if="notifications.length">
                <OverlayScrollbarsComponent class="announcement-menu__scrollbar">
                    <v-card-text>
                        <template v-for="(entry, index) in notifications" :key="entry.id">
                            <notification-menu-entry
                                :entry="entry"
                                :class="index < notifications.length - 1 ? '' : 'mb-0'"
                                :parent-state="boolMenu" />
                        </template>
                    </v-card-text>
                </OverlayScrollbarsComponent>
                <template v-if="notifications.length > 1">
                    <v-divider />
                    <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" color="primary" class="mr-2" @click="dismissAll">
                            <v-icon left>{{ mdiCloseBoxMultipleOutline }}</v-icon>
                            {{ $t('App.Notifications.DismissAll') }}
                        </v-btn>
                    </v-card-actions>
                </template>
            </template>
            <v-card-text v-else class="text-center">
                <span class="text-disabled">{{ $t('App.Notifications.NoNotification') }}</span>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import NotificationMenuEntry from '@/components/notifications/NotificationMenuEntry.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { mdiBell, mdiBellOutline, mdiCloseBoxMultipleOutline } from '@mdi/js'
import type { GuiNotificationStateEntry } from '@/store/gui/notifications/types'

const store = useStore()
const { isMobile } = useBase()

const boolMenu = ref(false)

const notifications = computed(() => store.getters['gui/notifications/getNotifications'] ?? [])

const existsCriticalAnnouncements = computed(
    () => notifications.value.filter((entry: GuiNotificationStateEntry) => entry.priority === 'critical').length > 0
)

const existsHighAnnouncements = computed(
    () => notifications.value.filter((entry: GuiNotificationStateEntry) => entry.priority === 'high').length > 0
)

const countNormalAnnouncements = computed(
    () => notifications.value.filter((entry: GuiNotificationStateEntry) => entry.priority === 'normal').length
)

const colorBadge = computed(() => {
    if (existsCriticalAnnouncements.value) return 'error'
    if (existsHighAnnouncements.value) return 'warning'

    return 'primary'
})

async function dismissAll() {
    notifications.value.forEach(async (entry: GuiNotificationStateEntry) => {
        if (entry.id.startsWith('announcement')) {
            await store.dispatch('gui/notifications/close', { id: entry.id })
        }

        await store.dispatch('gui/notifications/dismiss', { id: entry.id, type: 'reboot', time: null })
    })
}
</script>

<style scoped>
.announcement-menu__scrollbar {
    max-height: 500px;
}
</style>
