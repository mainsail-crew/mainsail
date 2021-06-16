import { ServerStateEvent } from "@/store/server/types"
import {FileStateFile} from "@/store/files/types";

export const findDirectory = (folder: FileStateFile[], dirArray: string[]): FileStateFile[] | null => {
    if (folder !== undefined && dirArray.length) {

        const parent = folder.find((element: FileStateFile) => (element.isDirectory && element.filename === dirArray[0]));
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

export const colorConsoleMessage = (item: ServerStateEvent): string => {
    if (item.message.startsWith('!! ')) return "red--text"
    if ('type' in item && item.type === 'command') return "blue--text"

    return ''
}

export const formatConsoleMessage = (message: string): string => {
    message = message.replaceAll('!! ', '')
    message = message.replaceAll('// ', '')
    message = message.replace('\n// ', '<br>')
    message = message.replace(/(?:\r\n|\r|\n)/g, '<br>')

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