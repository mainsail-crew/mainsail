/**
 * Authorization and Authentication RPC Interface
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/authorization/
 */
export interface AuthorizationRPC {
    'access.login': (params: {
        /** The user login name. */
        username: string
        /** The user password. */
        password: string
        /** A valid authentication source. */
        source: string
    }) => Promise<{
        username: string
        token: string
        refresh_token: string
        action: string
        source: string
    }>

    'access.logout': () => Promise<{
        username: string
        action: string
    }>

    'access.get_user': () => Promise<{
        username: string
        source: string
        created_on: number
    }>

    'access.info': () => Promise<{
        default_source: string
        available_sources: string[]
        login_required: boolean
        trusted: boolean
    }>

    'access.refresh_jwt': (params: { refresh_token: string }) => Promise<{
        username: string
        token: string
        source: string
        action: string
    }>

    'access.oneshot_token': () => Promise<string>
}
