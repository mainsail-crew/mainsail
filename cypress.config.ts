import { defineConfig } from 'cypress'
import pluginConfig from './cypress/plugins/index.js'

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            return pluginConfig(on, config)
        },
        baseUrl: 'http://localhost:4173',
    },
})
