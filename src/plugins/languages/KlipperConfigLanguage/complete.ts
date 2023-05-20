import { CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'

const blockTypeOptions = ['mcu', 'printer', 'adxl345', 'resonance_tester', 'stepper_x'].map((tag) => ({
    label: tag,
    type: 'namespace',
}))
const mcuParameterOptions = ['serial', 'baud', 'canbus_uuid', 'canbus_interface', 'restart_method'].map((tag) => ({
    label: tag + ': ',
    type: 'keyword',
}))
const printerParameterOptions = ['kinematics', 'max_velocity', 'max_accel', 'max_z_velocity', 'max_z_accel'].map(
    (tag) => ({
        label: tag + ': ',
        type: 'keyword',
    })
)
const adxl345Options = ['cs_pin'].map((tag) => ({
    label: tag + ': ',
    type: 'keyword',
}))

export function klipperConfigCompletionSource(context: CompletionContext) {
    const parent = syntaxTree(context.state).resolveInner(context.pos, -1)
    if (!parent) return null
    const tagBefore = getTagBefore(context.state, parent.from, context.pos)

    if (parent.type.name === 'Parameter') {
        const typeNode = findTypeNode(parent)
        if (!typeNode) return null
        const blocktype = context.state.sliceDoc(typeNode.from, typeNode.to)
        const options = getOptionsByBlockType(blocktype)
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: options,
            validFor: /^(\w*)?$/,
        }
    }

    if (parent.parent?.type.name === 'ConfigBlock') {
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: blockTypeOptions,
            validFor: /^(\w*)?$/,
        }
    }

    return null
}

function findTypeNode(node: SyntaxNode | null) {
    while (node) {
        if (node.type.name === 'ConfigBlock') {
            return node.firstChild
        }
        node = node.parent
    }
    return null
}

function getTagBefore(state: EditorState, from: number, pos: number) {
    const textBefore = state.sliceDoc(from, pos)
    return /\w*$/.exec(textBefore)
}

function getOptionsByBlockType(blocktype: string) {
    switch (blocktype) {
        case 'mcu':
            return mcuParameterOptions
        case 'printer':
            return printerParameterOptions
        case 'adxl345':
            return adxl345Options
        default:
            return null
    }
}
