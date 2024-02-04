import { FileStateFile } from '@/store/files/types'
import { PrinterStateMacroParams } from '@/store/printer/types'
import Vue from 'vue'

export const setDataDeep = (currentState: any, payload: any) => {
    if (payload !== null && typeof payload === 'object') {
        Object.keys(payload).forEach((key: string) => {
            const value = payload[key]

            if (
                typeof value === 'object' &&
                !Array.isArray(value) &&
                key in currentState &&
                value !== null &&
                currentState[key] !== null
            ) {
                setDataDeep(currentState[key], value)
            } else Vue.set(currentState, key, value)
        })
    }
}

export const findDirectory = (folder: FileStateFile[], dirArray: string[]): FileStateFile[] | null => {
    if (folder !== undefined && folder !== null && dirArray.length) {
        const parent = folder?.find((element: FileStateFile) => element.isDirectory && element.filename === dirArray[0])
        if (parent) {
            dirArray.shift()

            if (parent.childrens && dirArray.length) return findDirectory(parent.childrens, dirArray)
            else if (parent.childrens) return parent.childrens
        }

        return folder
    }

    return null
}

export const caseInsensitiveSort = (values: any[], orderType: string): any[] => {
    return values.sort((a, b) => {
        const stringA = a[orderType].toLowerCase()
        const stringB = b[orderType].toLowerCase()

        if (stringA < stringB) return -1
        if (stringA > stringB) return 1

        return 0
    })
}

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const camelize = (str: string): string => {
    return str
        .replace(/_/g, ' ')
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase()
        })
        .replace(/\s+/g, '')
}

export function formatConsoleMessage(message: string): string {
    // remove !! at error msg start
    message = message.replace(/^!! /g, '')
    // remove !! after \n new line
    message = message.replace(/\n!! /g, '\n')
    // remove // at command msg start
    message = message.replace(/^\/\/ /g, '')
    // remove // at \n new line
    message = message.replace(/\n\/\/ /g, '\n')
    // remove echo
    message = message.replace(/^echo:/g, '')
    message = message.replace(/^echo: /g, '')
    // replace linebreaks with html <br>
    message = message.replace('\n// ', '<br>')
    message = message.replace(/\r\n|\r|\n/g, '<br>')
    return message
}

export const convertName = (name: string): string => {
    let output = ''
    name = name.replace(/_/g, ' ')
    name.split(' ').forEach((split) => {
        output += ' ' + split.charAt(0).toUpperCase() + split.slice(1)
    })
    output = output.slice(1)

    return output
}

export const formatFilesize = (fileSizeInBytes: number): string => {
    let i = -1
    const byteUnits = [' kB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']
    do {
        fileSizeInBytes = fileSizeInBytes / 1024
        i++
    } while (fileSizeInBytes > 1024)

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

export const formatFrequency = (frequency: number): string => {
    let i = -1
    const units = [' kHz', ' MHz', ' GHz']
    do {
        frequency = frequency / 1000
        i++
    } while (frequency > 1000)

    return Math.max(frequency, 0.1).toFixed() + units[i]
}

export const formatPrintTime = (totalSeconds: number): string => {
    if (totalSeconds) {
        let output = ''

        const days = Math.floor(totalSeconds / (3600 * 24))
        if (days) {
            totalSeconds %= 3600 * 24
            output += days + 'd'
        }

        const hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        if (hours) output += ' ' + hours + 'h'

        const minutes = Math.floor(totalSeconds / 60)
        if (minutes) output += ' ' + minutes + 'm'

        const seconds = totalSeconds % 60
        if (seconds) output += ' ' + seconds.toFixed(0) + 's'

        return output
    }

    return '--'
}

export const sortFiles = (items: FileStateFile[] | null, sortBy: string[], sortDesc: boolean[]): FileStateFile[] => {
    const sortBySingle = sortBy.length ? sortBy[0] : 'filename'
    const sortDescSingle = sortDesc[0]

    if (items !== null) {
        // Sort by index
        items.sort(function (a: any, b: any) {
            if (a[sortBySingle] === b[sortBySingle]) return 0
            if (a[sortBySingle] === null || a[sortBySingle] === undefined) return -1
            if (b[sortBySingle] === null || b[sortBySingle] === undefined) return 1

            if (a[sortBySingle].constructor === String && b[sortBySingle].constructor === String) {
                return a[sortBySingle].localeCompare(b[sortBySingle], undefined, { sensivity: 'base' })
            }

            if (a[sortBySingle] instanceof Array && b[sortBySingle] instanceof Array) {
                const reducedA = a[sortBySingle].length ? a.filament.reduce((a: any, b: any) => a + b) : 0
                const reducedB = b[sortBySingle].length ? b.filament.reduce((a: any, b: any) => a + b) : 0
                return reducedA - reducedB
            }

            return a[sortBySingle] - b[sortBySingle]
        })

        // Deal with descending order
        if (sortDescSingle) items.reverse()

        // Then make sure directories come first
        items.sort((a: any, b: any) => (a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1))
    }

    return items ?? []
}

export function strLongestEqual(a: string, b: string): string {
    const l = Math.min(a?.length ?? Number.MAX_VALUE, b?.length ?? Number.MAX_VALUE)
    let i = 0
    while (i < l && (a.charCodeAt(i) ^ b.charCodeAt(i)) === 0) {
        i += 1
    }
    return a.substr(0, i)
}

export function reverseString(str: string): string {
    return str === '' ? '' : reverseString(str.substr(1)) + str.charAt(0)
}

export function formatTime(date: Date): string {
    let hours: string | number = date.getHours()
    if (hours < 10) hours = '0' + hours.toString()
    let minutes: string | number = date.getMinutes()
    if (minutes < 10) minutes = '0' + minutes.toString()
    let seconds: string | number = date.getSeconds()
    if (seconds < 10) seconds = '0' + seconds.toString()

    return hours + ':' + minutes + ':' + seconds
}

export function getMacroParams(macro: { gcode: string }): PrinterStateMacroParams {
    const paramRegex =
        /{%?.*?params\.([A-Za-z_0-9]+)(?:\|(int|string|double))?(?:\|default\('?"?(.*?)"?'?\))?(?:\|(int|string))?.*?%?}/

    let params = paramRegex.exec(macro.gcode)
    let currentMatch = macro.gcode
    let ret: PrinterStateMacroParams = null
    while (params) {
        if (ret === null) {
            ret = {}
        }
        const name = params[1]
        const t: 'int' | 'string' | 'double' | null = (params[2] ?? params[4] ?? null) as
            | 'int'
            | 'string'
            | 'double'
            | null
        const def = params[3] ?? null
        ret[`${name}`] = {
            type: t,
            default: def,
        }
        currentMatch = currentMatch.replace(params[0], '')
        params = paramRegex.exec(currentMatch)
    }

    const paramInRegex = /{%?.*?if.*?'([A-Za-z_0-9]+)' (?:not )?in params.*?%?}/
    params = paramInRegex.exec(macro.gcode)
    currentMatch = macro.gcode

    while (params) {
        if (ret === null) {
            ret = {}
        }
        const name = params[1]
        if (!(`${name}` in ret)) {
            ret[`${name}`] = {
                type: null,
                default: null,
            }
        }
        currentMatch = currentMatch.replace(params[0], '')
        params = paramInRegex.exec(currentMatch)
    }

    return ret
}

export function windowBeforeUnloadFunction(e: BeforeUnloadEvent) {
    e.preventDefault()
    e.returnValue = ''
}

export function copyToClipboard(text: string) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
        return
    }

    const textArea = document.createElement('textarea')
    let element = document.getElementById('devices-dialog')
    if (!element) element = document.body

    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.zIndex = '100000'
    textArea.style.opacity = '0'
    element.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
        document.execCommand('copy')
    } catch (err) {
        console.error('Unable to copy to clipboard', err)
    }
    textArea.remove()
}

export function sortResolutions(a: string, b: string) {
    const aSplit = parseInt(a.split('x')[0])
    const bSplit = parseInt(b.split('x')[0])

    return aSplit - bSplit
}
