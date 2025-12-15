import { FileStateFile } from '@/store/files/types'
import { PrinterStateMacroParams } from '@/store/printer/types'
import {
    mdiAlertOutline,
    mdiCheckboxMarkedCircleOutline,
    mdiCloseCircleOutline,
    mdiFlash,
    mdiGauge,
    mdiLightningBoltOutline,
    mdiMeterElectricOutline,
    mdiProgressClock,
    mdiScale,
    mdiThermometer,
} from '@mdi/js'
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
    // remove debug
    message = message.replace(/^debug:/g, '')
    // replace linebreaks with html <br>
    message = message.replace('\n// ', '<br>')
    message = message.replace(/\r\n|\r|\n/g, '<br>')

    return message.trim()
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

export const formatPrintTime = (totalSeconds: number, boolDays = true): string => {
    if (!totalSeconds) return '--'

    const output: string[] = []

    if (boolDays) {
        const days = Math.floor(totalSeconds / (3600 * 24))
        if (days) {
            totalSeconds %= 3600 * 24
            output.push(`${days}d`)
        }
    }

    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    if (hours) output.push(`${hours}h`)

    const minutes = Math.floor(totalSeconds / 60)
    if (minutes) output.push(`${minutes}m`)

    const seconds = totalSeconds % 60
    if (seconds) output.push(`${seconds.toFixed(0)}s`)

    return output.join(' ')
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

export function escapePath(path: string): string {
    return path
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')
}

export const unitToSymbol = (unit: string): string => {
    return (
        {
            // Energy
            wh: mdiLightningBoltOutline,
            kwh: mdiLightningBoltOutline,
            mwh: mdiLightningBoltOutline,
            j: mdiLightningBoltOutline,
            // Power
            w: mdiFlash,
            // Electrical
            v: mdiFlash,
            a: mdiMeterElectricOutline,
            // Temperature
            '°c': mdiThermometer,
            c: mdiThermometer,
            '°f': mdiThermometer,
            f: mdiThermometer,
            '°': mdiThermometer,
            // Mass
            g: mdiScale,
        }[unit?.toLowerCase()] ?? mdiGauge
    )
}

export const convertPrintStatusIconColor = (status: string): string => {
    switch (status) {
        case 'in_progress':
            return 'blue accent-3' //'blue-grey darken-1'
        case 'completed':
            return 'green' //'green'
        case 'cancelled':
            return 'red'

        default:
            return 'orange'
    }
}

export const convertPrintStatusIcon = (status: string) => {
    switch (status) {
        case 'in_progress':
            return mdiProgressClock
        case 'completed':
            return mdiCheckboxMarkedCircleOutline
        case 'cancelled':
            return mdiCloseCircleOutline

        default:
            return mdiAlertOutline
    }
}

export function filamentTextColor(hexColor: string): string {
    const splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d]{2})?$/i.exec(hexColor)

    if (splits === null || splits?.length < 3) return '#ffffff'

    const r = parseInt(splits[1], 16) * 0.2126
    const g = parseInt(splits[2], 16) * 0.7152
    const b = parseInt(splits[3], 16) * 0.0722
    const perceivedLightness = (r + g + b) / 255

    return perceivedLightness > 0.6 ? '#222' : '#fff'
}

export function toBoolean(val: unknown): boolean {
    if (typeof val === 'boolean') return val
    if (typeof val === 'number') return val !== 0
    if (typeof val === 'string') {
        const s = val.trim().toLowerCase()
        if (s === 'true' || s === '1' || s === 'yes' || s === 'y') return true
        if (s === 'false' || s === '0' || s === 'no' || s === 'n') return false
    }
    return Boolean(val)
}

export function filamentWeightFormat(weight: number): string {
    if (weight > 1000) return `${Math.round(weight / 10) / 100} kg`
    else if (weight > 100) return `${Math.round(weight)} g`

    return `${Math.round(weight * 10) / 10} g`
}

// This function is based on the Fluidd implementation
// https://github.com/fluidd-core/fluidd/blob/2425607e4eb507d4da84c18bfa77fecbc42f8a32/src/util/string-formatters.ts#L47
export function convertStringToArray(str: string, separator = ';'): string[] {
    if (!str) return []
    if (str.startsWith('["') && str.endsWith('"]')) {
        try {
            const arr = JSON.parse(str)
            if (Array.isArray(arr) && arr.every((item) => typeof item === 'string')) {
                return arr.map((s) => s.trim())
            }
        } catch (e) {
            // Fallback to separator split
        }
    }

    return str.split(separator).map((s) => s.replace(/^"|"$/g, '').trim())
}

/**
 * Converts a hex color string to an RGB object.
 *
 * Supports multiple hex formats:
 * - 6-digit: `#FF5500` or `FF5500`
 * - 3-digit shorthand: `#F50` or `F50` (expanded to `FF5500`)
 * - 8-digit with alpha: `#FF5500AA` (alpha channel is ignored)
 *
 * @param hex - Hex color string with or without leading `#`
 * @returns Object with `r`, `g`, `b` properties (0-255 each), or `null` if the input is invalid
 *
 * @example
 * // Standard 6-digit hex
 * convertHexToRgb('#FF5500') // { r: 255, g: 85, b: 0 }
 * // Without hash prefix
 * convertHexToRgb('FF5500') // { r: 255, g: 85, b: 0 }
 *
 * @example
 * // 3-digit shorthand (expanded: F→FF, 5→55, 0→00)
 * convertHexToRgb('#F50') // { r: 255, g: 85, b: 0 }
 *
 * @example
 * // 8-digit with alpha (alpha is stripped)
 * convertHexToRgb('#FF5500AA') // { r: 255, g: 85, b: 0 }
 *
 * @example
 * // Invalid input returns null
 * convertHexToRgb('invalid') // null
 * convertHexToRgb('#GG0000') // null
 */
export function convertHexToRgb(hex: string): { r: number; g: number; b: number } | null {
    let cleaned = hex.replace(/^#/, '').toLowerCase()

    if (cleaned.length === 8) cleaned = cleaned.slice(0, 6)
    if (cleaned.length === 3) {
        cleaned = cleaned
            .split('')
            .map((c) => c + c)
            .join('')
    }

    if (cleaned.length !== 6 || !/^[0-9a-f]{6}$/.test(cleaned)) {
        return null
    }

    return {
        r: parseInt(cleaned.slice(0, 2), 16),
        g: parseInt(cleaned.slice(2, 4), 16),
        b: parseInt(cleaned.slice(4, 6), 16),
    }
}

/**
 * Compares two hex colors and returns true if they match within the given tolerance.
 *
 * The comparison is performed on each RGB channel independently. Two colors are considered
 * matching if the absolute difference for each channel (R, G, B) is within the tolerance.
 *
 * @param color1 - First hex color string (e.g., '#FF5500', 'FF5500', '#F50', or 'F50')
 * @param color2 - Second hex color string (e.g., '#FF5500', 'FF5500', '#F50', or 'F50')
 * @param tolerance - Maximum allowed difference per RGB channel (0-255). Defaults to 0 (exact match)
 * @returns `true` if colors match within tolerance, `false` if they don't match or if either color is invalid
 *
 * @example
 * // Exact match
 * colorsMatch('#FF0000', '#FF0000') // true
 *
 * @example
 * // Match with tolerance
 * colorsMatch('#FF0000', '#FE0000', 1) // true (red differs by 1)
 * colorsMatch('#FF0000', '#FD0000', 1) // false (red differs by 2)
 *
 * @example
 * // Shorthand hex support
 * colorsMatch('#F00', '#FF0000') // true
 *
 * @example
 * // Invalid color returns false
 * colorsMatch('#FF0000', 'invalid') // false
 */
export function colorsMatch(color1: string, color2: string, tolerance = 0): boolean {
    const rgb1 = convertHexToRgb(color1)
    const rgb2 = convertHexToRgb(color2)

    if (rgb1 === null || rgb2 === null) return false

    return (
        Math.abs(rgb1.r - rgb2.r) <= tolerance &&
        Math.abs(rgb1.g - rgb2.g) <= tolerance &&
        Math.abs(rgb1.b - rgb2.b) <= tolerance
    )
}
