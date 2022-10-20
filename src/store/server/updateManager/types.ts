export interface ServerUpdateManagerState {
    version_info: {
        // eslint-disable-next-line
        [key: string]: any
    }
    updateResponse: {
        application: string
        complete: boolean
        messages: ServerUpdateManagerStateMessages[]
    }
}

export interface ServerUpdateManagerStateMessages {
    date: Date
    message: string
}

export interface ServerUpdateManagerStateVersionInfoGitRepoCommits {
    sha: string
    author: string
    date: string
    subject: string
    message: string
    tag: string | null
}

export interface ServerUpdateMangerStateVersionInfoGitRepo {
    branch: string
    channel: string
    commits_behind: ServerUpdateManagerStateVersionInfoGitRepoCommits[]
    configured_type: string
    current_hash: string
    debug_enabled: boolean
    detached: boolean
    detected_type: string
    full_version_string: string
    git_messages: string[]
    is_dirty: boolean
    is_valid: boolean
    need_channel_update: boolean
    owner: string
    pristine: boolean
    remote_alias: string
    remote_hash: string
    remote_version: string
    version: string
}

export interface ServerUpdateManagerStateVersionInfoWeb {
    channel: string
    configured_type: string
    name: string
    owner: string
    remote_version: string
    version: string
    last_error: string
}

export interface ServerUpdateManagerStateVersionInfoSystem {
    package_count: number
    package_list: string[]
}
