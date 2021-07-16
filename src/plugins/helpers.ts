import { ServerStateEvent } from "@/store/server/types"
import {FileStateFile} from "@/store/files/types";

export const findDirectory = (folder: FileStateFile[], dirArray: string[]): FileStateFile[] | null => {
    if (folder !== undefined && folder !== null && dirArray.length) {

        const parent = folder?.find((element: FileStateFile) => (element.isDirectory && element.filename === dirArray[0]));
        if (parent) {
            dirArray.shift();

            if (parent.childrens && dirArray.length) return findDirectory(parent.childrens, dirArray)
            else if(parent.childrens) return parent.childrens
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

export const camelize = (str: string): string => {
    return str.replaceAll('_', ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export function formatConsoleMessage(message: string): string {
    message = message.replaceAll('!! ', '')
    message = message.replaceAll('// ', '')
    message = message.replace('\n// ', '<br>')
    message = message.replace(/\r\n|\r|\n/g, '<br>')
    //message = message.replaceAll('<br />', '<br>')
    //return message.split('<br>');

    return message
}

export const convertName = (name: string): string => {
    let output = ""
    name = name.replaceAll("_", " ")
    name.split(" ").forEach(split => {
        output += " "+split.charAt(0).toUpperCase() + split.slice(1)
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

export const formatDate = (date: number): string => {
    const tmp2 = new Date(date)

    return tmp2.toLocaleString().replace(',', '')
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

export const sortFiles = (items: FileStateFile[] | null, sortBy: string[], sortDesc: boolean[]): FileStateFile[] => {
    const sortBySingle = sortBy.length ? sortBy[0] : 'filename';
    const sortDescSingle = sortDesc[0];

    if (items !== null) {
        // Sort by index
        items.sort(function(a: any, b: any) {
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
        items.sort((a: any, b: any) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? -1 : 1))
    }

    return items ?? []
}


export function strLongestEqual(a: string, b: string): string {
    const l = Math.min(a?.length ?? Number.MAX_VALUE, b?.length ?? Number.MAX_VALUE);
    let i = 0;
    while (i < l && (a.charCodeAt(i) ^ b.charCodeAt(i)) === 0) {
        i += 1;
    }
    return a.substr(0, i);
}

export function reverseString(str: string): string {
    return (str === '') ? '' : reverseString(str.substr(1)) + str.charAt(0);
}

export function formatTime(date: Date): string {
    let hours: string | number = date.getHours()
    if (hours < 10) hours = "0"+hours.toString()
    let minutes: string | number = date.getMinutes()
    if (minutes < 10) minutes = "0"+minutes.toString()
    let seconds: string | number = date.getSeconds()
    if (seconds < 10) seconds = "0"+seconds.toString()


    return hours+":"+minutes+":"+seconds
}
