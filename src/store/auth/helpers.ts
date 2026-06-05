export const getAuthStorageKey = (key: string, hostname: string, port: string | number) => {
    return `${key}_${hostname}_${port}`
}
