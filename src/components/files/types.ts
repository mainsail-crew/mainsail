/** Additional column of the file browser table */
export interface FileBrowserColumn {
    text: string
    value: string
    align?: 'start' | 'center' | 'end'
    sortable?: boolean
    class?: string
}

export type FilesNameDialogMode = 'createDirectory' | 'createFile' | 'rename' | 'duplicate'

/** Returns the names of files that belong to a file, e.g. the thumbnail of a timelapse video. */
export type FileRelatedFilesGetter = (filename: string) => string[]
