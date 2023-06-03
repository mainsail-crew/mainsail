export interface Parameter {
    name: string
    valueType: string
    isOptional: boolean
    tooltip: string
}

interface CfgBlock {
    type: string
    requiresName: boolean
    parameters: Parameter[]
}

interface CondParamBlock {
    triggerParameter: string
    parameters: Parameter[]
}

export function parseCfgMd(text: string): [Map<string, CfgBlock>, Map<string, CondParamBlock>] {
    const textLines = text.split('\n')
    const cfgBlockMap: Map<string, CfgBlock> = new Map()
    const depParamBlockMap: Map<string, CondParamBlock> = new Map()
    let currentCfgBlock: CfgBlock | null = null
    let currentCondParamBlock: CondParamBlock | null = null
    let isCodeSection = false
    let printerKinematics = ''
    let multipleTriggers: string[] = []

    for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
        const line = textLines[lineIndex]
        const trimmedLine = line.trim()

        // Save current currentBlock if end of the codeBlock is reached or if new block is started
        if ((trimmedLine === '```' && !isCodeSection) || /^#?\[.*\]$/.test(trimmedLine)) {
            if (currentCfgBlock || currentCondParamBlock) {
                if (currentCfgBlock) {
                    if (
                        !cfgBlockMap.has(currentCfgBlock.type) ||
                        (cfgBlockMap.get(currentCfgBlock.type)?.requiresName && !currentCfgBlock.requiresName)
                    ) {
                        cfgBlockMap.set(currentCfgBlock.type, currentCfgBlock)
                        currentCfgBlock = null
                    }
                } else if (currentCondParamBlock) {
                    if (multipleTriggers.length > 0) {
                        for (const trigger of multipleTriggers) {
                            const condParamBlock: CondParamBlock = {
                                triggerParameter: 'sensor_type:' + trigger.replace(/"/g, ''),
                                parameters: currentCondParamBlock.parameters,
                            }
                            depParamBlockMap.set(condParamBlock.triggerParameter, condParamBlock)
                        }
                        multipleTriggers = []
                    } else {
                        depParamBlockMap.set(currentCondParamBlock.triggerParameter, currentCondParamBlock)
                    }
                    currentCondParamBlock = null
                }
            }
            if (trimmedLine === '```' && !isCodeSection) printerKinematics = ''
        }
        // Start new codeBlock or ends it
        if (trimmedLine === '```') isCodeSection = !isCodeSection

        // Parse current cfg line
        if (isCodeSection) {
            // If [Block]
            if (/^#?\[.*\]$/.test(trimmedLine)) {
                const [type, name] = trimmedLine.replace(/\[|\]|#/g, '').split(' ')
                // Because multiple [Blocks] exist which are spesific to the printer kinematics (printerKinematics only set if in same CodeSection as [printer])
                const newType = printerKinematics !== '' ? type + '--' + printerKinematics : type
                currentCfgBlock = {
                    type: newType,
                    requiresName: !!name,
                    parameters: [],
                }
                // If under a [block] -> Parameter
            } else if (currentCfgBlock) {
                const parameterMatch = trimmedLine.match(/^(#?(\w+):)(.*)$/)
                if (parameterMatch) {
                    const [, parameterWithColon, parameterName, value] = parameterMatch
                    const parameter: Parameter = {
                        name: (parameterName.includes('<') ? parameterName.split('<')[0] : parameterName).toLowerCase(),
                        valueType: parseValue(value.trim(), parameterName),
                        tooltip: findTooltip(textLines, lineIndex),
                        isOptional: parameterWithColon.startsWith('#'),
                    }
                    // For all [blocks] which only exists to specify dependent parameters
                    if (
                        value.trim() !== '' &&
                        (parameterName === 'kinematics' ||
                            parameterName === 'lcd_type' ||
                            (parameterName === 'type' && currentCfgBlock.type === 'menu'))
                    ) {
                        if (parameterName === 'kinematics') printerKinematics = value.trim()
                        currentCondParamBlock = {
                            triggerParameter: (parameterName + ':' + value.trim()).toLowerCase(),
                            parameters: [],
                        }
                        currentCfgBlock = null
                    } else {
                        currentCfgBlock.parameters.push(parameter)
                    }
                }
                // If no [block] but Parameter -> dependent Parameter
            } else {
                const parameterMatch = trimmedLine.match(/^(#?(\w+):)(.*)$/)
                if (parameterMatch) {
                    const [, parameterWithColon, parameterName, value] = parameterMatch
                    const tooltip = findTooltip(textLines, lineIndex)
                    const parameter: Parameter = {
                        name: parameterName.toLowerCase(),
                        valueType: parseValue(value.trim(), parameterName),
                        tooltip: tooltip,
                        isOptional: parameterWithColon.startsWith('#'),
                    }
                    if (currentCondParamBlock == null) {
                        const match = tooltip.match(/One of\s+(.+)/)
                        if (match && match[1]) {
                            const values = match[1].match(/"([^"]+)"/g) ?? []
                            multipleTriggers = values
                        }
                        currentCondParamBlock = {
                            triggerParameter: (parameterName + ':' + value.trim()).toLowerCase(),
                            parameters: [parameter],
                        }
                    } else {
                        currentCondParamBlock.parameters.push(parameter)
                    }
                }
            }
        }
    }

    return [cfgBlockMap, depParamBlockMap]
}

function parseValue(valueType: string, parameterName: string): string {
    if (['true', 'false', 'True', 'False'].includes(valueType)) {
        return 'Boolean'
    } else if (parameterName.includes('gear_ratio')) {
        return 'Ratio'
    } else if (/^-?\d+(?:\.\d+)?(,\s*-?\d+(?:\.\d+)?)+$/.test(valueType)) {
        return 'Cords'
    } else if (parameterName.includes('gcode')) {
        return 'Jinja2'
    } else if (parameterName.includes('pin') || valueType.match(/^(\^?!?PE\d\d?)|([^\s:]*:[^\s:]*)$/)) {
        return 'Pin'
    } else if (/^-?\d+(?:\.\d+)?$/.test(valueType)) {
        return 'Number'
    } else if (valueType === '') {
        return 'any'
    } else {
        return 'String'
    }
}

function findTooltip(textLines: string[], currentLineIndex: number): string {
    const tooltipLines: string[] = []
    for (let i = currentLineIndex + 1; i < textLines.length; i++) {
        const trimmedNextLine = textLines[i].trim()
        if (trimmedNextLine.startsWith('#   ')) {
            tooltipLines.push(trimmedNextLine.substring(3).trim())
        } else {
            break
        }
    }
    return tooltipLines.join(' ').trim()
}

export function printCfgMd(text: string) {
    const [parsedMd, CondParamBlock] = parseCfgMd(text)
    parsedMd.forEach((cfgBlock) => {
        let msg = ''
        msg += `[${cfgBlock.type}]   ${cfgBlock.requiresName}\n`
        cfgBlock.parameters.forEach((parameter) => {
            if (parameter.isOptional) {
                msg += `|- ?${parameter.name}: ${parameter.valueType}\n`
            } else {
                msg += `|- ${parameter.name}: ${parameter.valueType}\n`
            }
        })
        console.log(msg)
    })
    CondParamBlock.forEach((dependentParameter) => {
        let msg = ''
        msg += `${dependentParameter.triggerParameter}\n`
        dependentParameter.parameters.forEach((parameter) => {
            if (parameter.isOptional) {
                msg += `|- ?${parameter.name}: ${parameter.valueType}\n`
            } else {
                msg += `|- ${parameter.name}: ${parameter.valueType}\n`
            }
        })
        console.log(msg)
    })
}
