<template>
    <div class="d-flex flex-wrap">
        <div class="text-no-wrap mr-1">{{ formatName }}:</div>
        <div v-for="(detail, index) in details" :key="index" class="text-no-wrap">
            <span>{{ detail }}</span>
            <span v-if="index + 1 < details.length" class="mr-1">,</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { formatFilesize } from '@/plugins/helpers'
@Component({
    components: { Panel },
})
export default class SystemPanelHostInterface extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    @Prop({ required: true, type: String }) readonly name!: string

    get formatName() {
        if (this.ipAddress) return `${this.name} (${this.ipAddress})`

        return this.name
    }

    get network() {
        return this.$store.state.server.system_info?.network ?? null
    }

    get interface() {
        return this.network[this.name] ?? null
    }

    get ipAddresses(): { family: 'ipv4' | 'ipv6'; address: string; is_link_local: boolean }[] {
        return this.interface?.ip_addresses ?? []
    }

    get ipAddress() {
        const protocols = ['ipv4', 'ipv6']

        for (const protocol of protocols) {
            const ip = this.ipAddresses.find((ip) => ip.family === protocol)
            if (ip) return ip.address
        }

        return null
    }

    get stats() {
        const network_stats = this.$store.state.server.network_stats ?? null
        if (!network_stats) return null

        return network_stats[this.name] ?? null
    }

    get speed() {
        return this.stats?.bandwidth ?? 0
    }

    get rx() {
        return this.stats?.rx_bytes ?? 0
    }

    get tx() {
        return this.stats?.tx_bytes ?? 0
    }

    get details() {
        return [
            `${this.formatFilesize(this.speed)}/s`,
            `Rx: ${this.formatFilesize(this.rx)}`,
            `Tx: ${this.formatFilesize(this.tx)}`,
        ]
    }
}
</script>
