import fs from 'fs'
import path from 'path'
import { version } from '../../package.json'
import { PluginOption } from 'vite'

/**
 * Custom build plugin to write the version in a deticated .version file after bundling
 */

export default function buildVersion(): PluginOption {
    return {
        name: 'build-version',
        writeBundle: () => {
            setImmediate(async () => {
                const versionIdentifier = version.toString()
                const versionFile = await fs.promises.open(path.resolve(__dirname, '../../dist/.version'), 'w')
                await versionFile.writeFile(`v${versionIdentifier}`)
                await versionFile.close()
            })
        },
    }
}
