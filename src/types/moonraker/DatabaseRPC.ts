/**
 * Database Management RPC Interface
 *
 * These endpoints provide access to Moonraker's internal sqlite database.
 * The primary table exposed to clients is divided into namespaces. Each client
 * may define its own namespace to store information. Items in the database are
 * accessed by providing a namespace and a key.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/database/
 */
export interface DatabaseRPC {
    /**
     * Lists all namespaces with read and/or write access.
     * Also lists database backup files.
     */
    'server.database.list': (params?: {
        /** The root namespace to list (optional) */
        root?: string
    }) => Promise<{
        /** An array of namespaces registered with the database */
        namespaces: string[]
        /** An array of database backup filenames */
        backups: string[]
    }>

    /**
     * Retrieves an item from a specified namespace.
     * If key is omitted, the entire namespace will be returned.
     * If the key is provided and does not exist, an error will be returned.
     */
    'server.database.get_item': (params: {
        /** The namespace of the item to retrieve */
        namespace: string
        /** The key indicating the field(s) to retrieve. May be a string or array of strings */
        key?: string | string[]
    }) => Promise<{
        /** The namespace of the returned item */
        namespace: string
        /** The key indicating the requested field(s) */
        key: string | string[] | null
        /** The value of the requested item (any valid JSON type) */
        value: unknown
    }>

    /**
     * Inserts an item into the database.
     * If the namespace does not exist it will be created.
     * If the key specifies a nested field, all parents will be created if they do not exist.
     * If the key exists it will be overwritten with the provided value.
     */
    'server.database.post_item': (params: {
        /** The namespace where the value should be inserted */
        namespace: string
        /** The key indicating the field(s) where the value should be inserted */
        key: string | string[]
        /** The value to insert (any valid JSON type) */
        value: unknown
    }) => Promise<{
        /** The namespace where the value was inserted */
        namespace: string
        /** The key indicating the field(s) where the value was inserted */
        key: string | string[]
        /** The value inserted into the database */
        value: unknown
    }>

    /**
     * Deletes an item from a namespace at the specified key.
     * If the key does not exist in the namespace an error will be returned.
     * If the deleted item results in an empty namespace, the namespace will be removed.
     */
    'server.database.delete_item': (params: {
        /** The namespace where the item should be removed */
        namespace: string
        /** The key indicating the field(s) to remove */
        key: string | string[]
    }) => Promise<{
        /** The namespace containing the item removed */
        namespace: string
        /** The key indicating the field(s) where the item was removed */
        key: string | string[]
        /** The value of the removed item */
        value: unknown
    }>

    /**
     * Compacts and defragments the sqlite database using the VACUUM command.
     * This endpoint cannot be requested when Klipper is printing.
     */
    'server.database.compact': () => Promise<{
        /** Size in bytes of the database prior to compaction */
        previous_size: number
        /** Size in bytes of the database after compaction */
        new_size: number
    }>

    /**
     * Creates a backup of the current database.
     * The backup will be created in <data_path>/backup/database/<filename>.
     * This endpoint cannot be requested when Klipper is printing.
     */
    'server.database.post_backup': (params?: {
        /** The filename for the backup (default: sqldb-backup-{timespec}.db) */
        filename?: string
    }) => Promise<{
        /** The complete absolute path where the backup was saved */
        backup_path: string
    }>

    /**
     * Deletes a previously backed up database.
     */
    'server.database.delete_backup': (params: {
        /** The name of the backup file to delete */
        filename: string
    }) => Promise<{
        /** The complete absolute path where the backup was removed */
        backup_path: string
    }>

    /**
     * Restores a previously backed up sqlite database file.
     * The backup must be located at <data_path>/backup/database/<filename>.
     * This endpoint cannot be requested when Klipper is printing.
     * Note: Moonraker will restart immediately after this request is processed.
     */
    'server.database.restore': (params: {
        /** The name of the backup file to restore */
        filename: string
    }) => Promise<{
        /** An array of table names that were recovered */
        restored_tables: string[]
        /** An array of namespaces that were recovered */
        restored_namespaces: string[]
    }>
}
