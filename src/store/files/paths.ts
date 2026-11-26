/**
 * Path helpers for the files store.
 *
 * All paths in the store are normalized: no leading, trailing or double slashes,
 * e.g. 'gcodes/subdir/file.gcode'. The first segment is the root.
 */

export const normalizePath = (path: string): string =>
    path
        .split('/')
        .filter((segment) => segment !== '')
        .join('/')

export const joinPath = (...parts: string[]): string => normalizePath(parts.join('/'))

/** Splits a path into its parent directory and its name, e.g. 'gcodes/a/b.gcode' -> 'gcodes/a' + 'b.gcode' */
export const splitPath = (path: string): { dir: string; name: string } => {
    const normalized = normalizePath(path)
    const pos = normalized.lastIndexOf('/')
    if (pos === -1) return { dir: '', name: normalized }

    return { dir: normalized.slice(0, pos), name: normalized.slice(pos + 1) }
}

export const getRoot = (path: string): string => normalizePath(path).split('/')[0]

/** Returns the path without its root, e.g. 'gcodes/a/b.gcode' -> 'a/b.gcode' */
export const stripRoot = (path: string): string => normalizePath(path).split('/').slice(1).join('/')

/** Checks if a path is the given directory or inside of it. */
export const isInPath = (path: string, directory: string): boolean =>
    path === directory || path.startsWith(directory + '/')

/** Replaces the directory prefix of a path, e.g. ('gcodes/a/b', 'gcodes/a', 'gcodes/c') -> 'gcodes/c/b' */
export const replacePathPrefix = (path: string, source: string, dest: string): string =>
    dest + path.slice(source.length)

export const getExtension = (filename: string): string => {
    const pos = filename.lastIndexOf('.')
    if (pos === -1) return ''

    return filename.slice(pos).toLowerCase()
}
