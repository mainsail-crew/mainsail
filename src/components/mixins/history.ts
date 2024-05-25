import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class HistoryMixin extends Vue {
    get moonrakerHistoryFields() {
        const config = this.$store.state.server.config?.config ?? {}
        const sensors = Object.keys(config).filter((key) => key.startsWith('sensor '))
        const historyFields: { desc: string; unit: string; provider: string; name: string; parameter: string }[] = []

        sensors.forEach((configName) => {
            const sensor = config[configName] ?? {}

            Object.keys(sensor)
                .filter((key) => key.startsWith('history_field_'))
                .forEach((key) => {
                    const historyField = sensor[key]

                    historyFields.push({
                        desc: historyField.desc,
                        unit: historyField.units,
                        provider: configName,
                        parameter: historyField.parameter,
                        name: key,
                    })
                })
        })

        return historyFields
    }
}
