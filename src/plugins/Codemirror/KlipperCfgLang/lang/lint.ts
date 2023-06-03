import { syntaxTree } from '@codemirror/language'
import { linter, Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
import { exampleText } from '../parserCfgMd/ref.js'
import { parseCfgMd, Parameter } from '../parserCfgMd/parserCfgMd.js'
import { EditorView } from 'codemirror'

// Parse Cfg Reference
const [mdCfgBlockMap, mdDepParamBlockMap] = parseCfgMd(exampleText)

export const klipperCfgLint = linter(lintSource)

export function lintSource(view: EditorView) {
    const diagnostics: Diagnostic[] = []
    const programmNode = syntaxTree(view.state).topNode
    const importNodes = programmNode.getChildren('Import')
    const cfgBlockNodes = getAllUsedBlockNodes(programmNode, view.state, diagnostics) // also adds diagnostics for duplicate BlockTypes
    const autoGenBlockMap = getAllUsedAutoGenBlocks(view.state, programmNode)

    // check imports
    importNodes.forEach((importNode) => {
        const pathNode = importNode.getChild('FilePath')
        if (!pathNode) {
            addToDiagnostics(diagnostics, importNode, 'Import must be a file or file path')
        }
    })

    // check all cfg blocks
    const printerKinematics = getPrinterKinematics(view.state, programmNode)
    const allPossibleBlockTypes = getAllPossibleBlockTypes(view.state, printerKinematics)

    cfgBlockNodes.forEach((cfgBlockNode, blockTypeIdent) => {
        const blockTypeNode = cfgBlockNode.getChild('BlockType')
        if (!blockTypeNode) return
        let [blockType, identifier] = blockTypeIdent.split(' ')
        if (/[^0-9][2-9]$/.test(blockType)) blockType = blockType.slice(0, -1) + '1' // e.g. extruder2 -> extruder1 to find options in mdCfgBlockMap

        // check if BlockType is valid
        if (!allPossibleBlockTypes.has(blockType)) {
            let msg = 'Invalid BlockType: ' + blockType
            const possibleAlternatives = findClosestMatches(blockType, allPossibleBlockTypes)
            if (possibleAlternatives.length > 0) {
                msg += '\nDid you mean: ' + possibleAlternatives.map((item) => `"${item}"`).join(', ') + ' ?'
            }
            msg += '\n(forther linting in this block is not possible)'
            addToDiagnostics(diagnostics, blockTypeNode, msg)
            return
        }

        // check if BlockName/identifier is given if required
        if (!identifier && mdCfgBlockMap.get(blockType)?.requiresName) {
            addToDiagnostics(diagnostics, blockTypeNode, 'Identifier required!\nLike [' + blockType + ' myName]')
        }

        const usedOptions = getAllUsedOptionsForBlock(cfgBlockNode, view.state, diagnostics, autoGenBlockMap) // also add diagnostics for duplicate Parameters
        if (usedOptions.size == 0) return
        const allPossibleOptions = getAllPossibleOptionsForBlock(blockType, usedOptions)
        if (allPossibleOptions.size == 0) return

        // check if all required options are given
        allPossibleOptions.forEach((option, parameter) => {
            if (!option.isOptional && !usedOptions.has(parameter)) {
                addToDiagnostics(diagnostics, blockTypeNode, 'Missing required Parameter: ' + parameter)
            }
        })

        usedOptions.forEach(({ paramValue, optionNode }, parameter) => {
            // check if used option is valid in this blocktype
            if (/^screw\d/.test(parameter)) parameter = parameter.replace(/\d/, '1') // e.g. screw4 -> screw1 to find options in mdCfgBlockMap
            if (!allPossibleOptions.has(parameter)) {
                addToDiagnostics(diagnostics, optionNode, 'Invalid Parameter in this Block!')
                return
            }

            // check if used option has correct value type
            if (paramValue.includes('gcode:')) return // because the current use of the old Jinja2 parser there is no good way to check the value
            const valueNode = optionNode.getChild('Value') ?? optionNode.getChild('AutoGenValue')
            const valueType = valueNode?.firstChild?.name ?? '⚠'
            if (!valueNode || !valueType || valueType === '⚠') {
                addToDiagnostics(diagnostics, optionNode, 'Missing value for Parameter: ' + parameter)
                return
            }
            const refParam = allPossibleOptions.get(parameter)
            if (!refParam) return
            if (refParam.valueType !== 'any' && !valueType.includes(refParam.valueType)) {
                addToDiagnostics(
                    diagnostics,
                    optionNode,
                    'Wrong value-type (' +
                        valueType +
                        ') for Parameter: ' +
                        parameter +
                        '! Expected: ' +
                        refParam.valueType
                )
                return
            }
        })
    })

    return diagnostics
}

function addToDiagnostics(diagnostics: Diagnostic[], node: SyntaxNode, message: string) {
    diagnostics.push({
        from: node.from,
        to: node.to,
        severity: 'error',
        message: message,
    })
}

function findPrinterNode(programmNode: SyntaxNode, state: EditorState) {
    const printerNode =
        programmNode.getChildren('ConfigBlock')?.find((cfgBlockNode) => {
            const blockTypeNode = cfgBlockNode.getChild('BlockType')
            if (!blockTypeNode) return false
            return state.sliceDoc(blockTypeNode.from, blockTypeNode.to).trim().toLowerCase() === 'printer'
        }) ?? null
    return printerNode
}

function getPrinterKinematics(state: EditorState, programmNode: SyntaxNode) {
    const printerOptions = findPrinterNode(programmNode, state)?.getChild('Body')?.getChildren('Option') ?? []

    for (const childNode of printerOptions) {
        const parameter = childNode.getChild('Parameter')
        const value = childNode.getChild('Value')
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to).trim().toLowerCase()
        if (parameterName !== 'kinematics') continue
        const printerKinematics = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        return printerKinematics.split('#')[0].trim().toLowerCase()
    }

    return ''
}

function getAllPossibleBlockTypes(state: EditorState, printerKinematics: string) {
    let blockTypes = Array.from(mdCfgBlockMap.keys())
    // if no printerKinematics is set, no filtering (all steppers_ possible) else filter steppers_ by printerKinematics
    if (printerKinematics !== '') {
        blockTypes = blockTypes.filter(
            (blockType) => /^(?!stepper_\D*$).+/.test(blockType) || blockType.includes('--' + printerKinematics)
        )
    }
    blockTypes = blockTypes.map((blockType) => (blockType.includes('--') ? blockType.split('-')[0] : blockType))
    return new Set(blockTypes)
}

function getAllUsedBlockNodes(programmNode: SyntaxNode, state: EditorState, diagnostics: Diagnostic[]) {
    const cfgBlockNodes = programmNode.getChildren('ConfigBlock')
    const cfgBlockNodeMap = new Map<string, SyntaxNode>()

    cfgBlockNodes.forEach((cfgBlockNode) => {
        const blockTypeNode = cfgBlockNode.getChild('BlockType')
        if (!blockTypeNode) return
        const blockType = state.sliceDoc(blockTypeNode.from, blockTypeNode.to).trim().toLowerCase()

        const identifierNode = cfgBlockNode.getChild('Identifier')
        const identifierName = identifierNode
            ? state.sliceDoc(identifierNode.from, identifierNode.to).trim().toLowerCase()
            : ''

        const mapKey = blockType + ' ' + identifierName
        if (cfgBlockNodeMap.has(mapKey)) addToDiagnostics(diagnostics, blockTypeNode, 'Duplicate BlockType')
        else cfgBlockNodeMap.set(mapKey, cfgBlockNode)
    })

    return cfgBlockNodeMap
}

function findClosestMatches(input: string, set: Set<string>): string[] {
    const matches = []
    let minErrors = Infinity

    for (const str of set) {
        const errors = calculateErrors(input, str)
        if (errors <= minErrors) {
            minErrors = errors
            if (errors === 0) {
                matches.unshift(str) // Add exact matches at the beginning
            } else {
                matches.push(str) // Add other matches at the end
            }
        }
    }

    return matches
}

function calculateErrors(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const dp: number[][] = []

    for (let i = 0; i <= len1; i++) {
        dp[i] = []
        dp[i][0] = i
    }
    for (let j = 0; j <= len2; j++) {
        dp[0][j] = j
    }
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
        }
    }

    return dp[len1][len2]
}

function getAllUsedOptionsForBlock(
    cfgBlockNode: SyntaxNode,
    state: EditorState,
    diagnostics: Diagnostic[],
    autoGenBlockMap: Map<string, SyntaxNode[]>
) {
    const optionsNodeMap = new Map<string, { paramValue: string; optionNode: SyntaxNode }>()
    const optionNodes = cfgBlockNode.getChild('Body')?.getChildren('Option') ?? []
    const blockTypeNode = cfgBlockNode.getChild('BlockType')
    if (!optionNodes || !blockTypeNode) return optionsNodeMap
    const blockType = state.sliceDoc(blockTypeNode.from, blockTypeNode.to).trim().toLowerCase()
    const autoGenParams = autoGenBlockMap.get(blockType)
    if (autoGenParams && blockType !== 'bed_mesh') optionNodes.push(...autoGenParams)

    optionNodes.forEach((optionNode) => {
        const parameterNode = optionNode.getChild('Parameter')

        if (!parameterNode) {
            const gcodeNode = optionNode.getChild('GcodeKeyword')
            if (!gcodeNode) return
            const gcodeParam = state.sliceDoc(gcodeNode.from, gcodeNode.to).trim().toLowerCase()
            if (gcodeParam === '') return
            if (optionsNodeMap.has(gcodeParam)) addToDiagnostics(diagnostics, gcodeNode, 'Duplicate Parameter')
            else optionsNodeMap.set(gcodeParam.split(':')[0], { paramValue: gcodeParam, optionNode: gcodeNode })
            return
        }

        const parameter = state.sliceDoc(parameterNode.from, parameterNode.to).trim().toLowerCase()
        const valueNode = optionNode.getChild('Value') ?? optionNode.getChild('AutoGenValue')
        const value = valueNode ? state.sliceDoc(valueNode.from, valueNode.to).trim().toLowerCase() : ''
        const paramValue = parameter + ':' + value

        if (optionsNodeMap.has(parameter)) addToDiagnostics(diagnostics, parameterNode, 'Duplicate Parameter')
        else optionsNodeMap.set(parameter, { paramValue, optionNode })
    })

    return optionsNodeMap
}

function getAllPossibleOptionsForBlock(
    blockType: string,
    usedOptions: Map<string, { paramValue: string; optionNode: SyntaxNode }>
) {
    const allPossibleOptions = new Map<string, Parameter>()
    const blockTypeOptions = mdCfgBlockMap.get(blockType)?.parameters ?? []
    blockTypeOptions.forEach((parameter) => {
        allPossibleOptions.set(parameter.name, parameter)
    })

    if (blockType.includes('heater_')) {
        const heaterOptions = mdCfgBlockMap.get('heater_generic')?.parameters ?? []
        heaterOptions.forEach((parameter) => {
            if (!allPossibleOptions.has(parameter.name)) allPossibleOptions.set(parameter.name, parameter)
        })
    }

    usedOptions.forEach(({ paramValue }) => {
        const depParams = mdDepParamBlockMap.get(paramValue)
        if (depParams) {
            depParams.parameters.forEach((parameter) => {
                allPossibleOptions.set(parameter.name, parameter)
            })
        }
    })

    return allPossibleOptions
}

function getAllUsedAutoGenBlocks(state: EditorState, programmNode: SyntaxNode) {
    const autoGenParams = new Map<string, SyntaxNode[]>()
    const autoGenBlocks = programmNode.getChild('AutoGenSection')?.getChildren('AutoGenBlock') ?? []

    autoGenBlocks.forEach((autoGenBlock) => {
        const blockTypeNode = autoGenBlock.getChild('BlockType')
        if (!blockTypeNode) return
        const blockType = state.sliceDoc(blockTypeNode.from, blockTypeNode.to).trim().toLowerCase()
        const autoGenOptionNodes = autoGenBlock.getChild('AutoGenBody')?.getChildren('AutoGenOption')
        if (!autoGenOptionNodes) return
        autoGenParams.set(blockType, autoGenOptionNodes)
    })

    return autoGenParams
}
