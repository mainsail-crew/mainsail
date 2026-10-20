export const includePattern = /^\[include ([^#\n]*)\]/g

export function resolveIncludePath(directory: string, include: string): string | null {
    const path = include.trim()
    if (!path || path.startsWith('/') || path.endsWith('/') || /[*?[]/.test(path)) return null
    const parts = `${directory}/${path}`.split('/')
    if (parts.includes('..')) return null
    return parts.filter((part) => part && part !== '.').join('/') || null
}
