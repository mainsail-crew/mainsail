import { NodeType, Parser } from '@lezer/common'
import { testTree } from '@lezer/generator/dist/test'

function toLineContext(file: string, index: number) {
    const endEol = file.indexOf('\n', index + 80)

    const endIndex = endEol === -1 ? file.length : endEol

    return file
        .substring(index, endIndex)
        .split(/\n/)
        .map((str) => '  | ' + str)
        .join('\n')
}

function defaultIgnore(type: NodeType) {
    return /\W/.test(type.name)
}

function getLineNumber(text: string, index: number) {
    const substring = text.substring(0, index)
    const newLineRegex = /\n/g
    const lineCount = (substring.match(newLineRegex) || []).length + 1
    return lineCount
}

export function fileTests(file: string, fileName: string, onlyNoError = false, mayIgnore = defaultIgnore) {
    const caseExpr = /\s*#[ \t]*(.*)(?:\r\n|\r|\n)([^]*?)==+>([^]*?)(?:$|(?:\r\n|\r|\n)+(?=#))/gy
    const tests: {
        name: string
        text: string
        expected: string
        strict: boolean
        run(parser: Parser): void
    }[] = []
    let lastIndex = 0
    if (onlyNoError) {
        tests.push({
            name: fileName,
            text: file,
            expected: 'no parsing errors',
            strict: true,
            run(parser: Parser) {
                parser
                    .parse(file)
                    .cursor()
                    .iterate((node) => {
                        if (node.type.isError) {
                            let msg = 'Parse error at line ' + getLineNumber(file, node.from) + ': '
                            const parseError = '"' + file.slice(node.from, node.to) + '" '
                            if (parseError.length > 100) msg += parseError.slice(0, 100) + '...'
                            else msg += parseError
                            const context =
                                '\n\t(context: ' + JSON.stringify(file.slice(node.from - 10, node.to + 10)) + ')'
                            msg += context.length > 100 ? context.slice(0, 100) + '...' : context
                            throw new Error(msg)
                        }
                    })
            },
        })
    } else {
        for (;;) {
            const m = caseExpr.exec(file)
            if (!m) throw new Error(`Unexpected file format in ${fileName} around\n\n${toLineContext(file, lastIndex)}`)

            const text = m[2]
            const expected = m[3].trim()
            const [, name, configStr] = /(.*?)(\{.*?\})?$/.exec(m[1])!

            if (expected == 'error') {
                tests.push({
                    name,
                    text,
                    expected: 'error while parsing',
                    strict: false,
                    run(parser: Parser) {
                        let parsingError = false
                        parser
                            .parse(text)
                            .cursor()
                            .iterate((node) => {
                                if (node.type.isError) parsingError = true
                            })
                        if (!parsingError) throw new Error('Parsed without error, but error was expected!')
                    },
                })
            } else {
                const config = configStr ? JSON.parse(configStr) : null
                const strict = !/⚠|\.\.\./.test(expected)
                tests.push({
                    name,
                    text,
                    expected,
                    strict,
                    run(parser: Parser) {
                        if ((parser as any).configure && (strict || config))
                            parser = (parser as any).configure({ strict, ...config })
                        testTree(parser.parse(text), expected, mayIgnore)
                    },
                })
            }
            lastIndex = m.index + m[0].length
            if (lastIndex == file.length) break
        }
    }
    return tests
}
