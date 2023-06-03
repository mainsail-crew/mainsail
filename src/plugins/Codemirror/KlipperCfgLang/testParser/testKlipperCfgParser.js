import { parser } from '../dist/klipperCfgParser.cjs'
import { fileTestsParser } from '../../mochaFileTests.js'
import * as fs from 'fs'
import * as path from 'path'

const caseDir = 'src/plugins/Codemirror/KlipperCfgLang/testParser/test-cases'
const testConfigsDir = 'src/plugins/Codemirror/KlipperCfgLang/testParser/test-configs'

for (let file of fs.readdirSync(caseDir)) {
    if (!/\.txt$/.test(file)) continue

    let result = /^[^.]+/.exec(file)
    let name = result ? result[0] : 'default-name'
    describe(name, () => {
        for (let { name, run } of fileTestsParser(fs.readFileSync(path.join(caseDir, file), 'utf8'), file))
            it(name, () => run(parser))
    })
}

for (let file of fs.readdirSync(testConfigsDir)) {
    let result = /^[^.]+/.exec(file)
    let name = result ? result[0] : 'default-name'
    describe(name, () => {
        for (let { name, run } of fileTestsParser(fs.readFileSync(path.join(testConfigsDir, file), 'utf8'), file, true))
            it(name, () => run(parser))
    })
}
