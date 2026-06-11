<template>
    <div>
        <v-row class="py-2">
            <v-col class="pl-6">
                <strong>{{ $t('Machine.UpdatePanel.System') }}</strong>
                <br />
                <template v-if="package_count">
                    <a class="info--text cursor--pointer" @click="boolShowPackageList = true">
                        <v-icon small color="info" class="mr-1">{{ mdiInformation }}</v-icon>
                        {{ $t('Machine.UpdatePanel.CountPackagesCanBeUpgraded', { count: package_count }) }}
                    </a>
                </template>
                <span v-else>{{ $t('Machine.UpdatePanel.OSPackages') }}</span>
            </v-col>
            <v-col class="v-col-auto pr-6 text-right" align-self="center">
                <v-chip
                    small
                    label
                    outlined
                    :color="btnColor"
                    :disabled="btnDisabled"
                    class="minwidth-0 px-2 text-uppercase"
                    @click="doUpdate">
                    <v-icon small class="mr-1">{{ btnIcon }}</v-icon>
                    {{ btnText }}
                </v-chip>
            </v-col>
        </v-row>
        <system-packages-list v-model="boolShowPackageList" :packages-list="package_list" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiInformation, mdiProgressUpload } from '@mdi/js'

const { printer_state } = useBase()
const store = useStore()
const socket = useSocket()
const { t } = useI18n()


const boolShowPackageList = ref(false)

const package_count = computed(() =>
    store.state.server.updateManager?.system?.package_count ?? 0
)

const package_list = computed(() =>
    store.state.server.updateManager?.system?.package_list ?? []
)

const btnDisabled = computed(() => {
    if (['printing', 'paused'].includes(printer_state.value)) return true
    return package_count.value === 0
})

const btnIcon = computed(() => {
    if (package_count.value) return mdiProgressUpload
    return mdiCheck
})

const btnColor = computed(() => {
    if (package_count.value) return 'primary'
    return 'green'
})

const btnText = computed(() => {
    if (package_count.value) return t('Machine.UpdatePanel.Upgrade')
    return t('Machine.UpdatePanel.UpToDate')
})

function doUpdate() {
    socket.emit('machine.update.system', {})
}
</script>

<style scoped></style>
