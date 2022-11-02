export interface ServerUpdateManagerState {
    busy: boolean
    github_rate_limit: number | null
    github_requests_remaining: number | null
    github_limit_reset_time: number | null
    git_repos: ServerUpdateManagerStateGitRepo[]
    web_repos: ServerUpdateManagerStateWebRepo[]
    system: {
        package_count: 0
        package_list: string[]
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

export interface ServerUpdateManagerStateGitRepoCommits {
    sha: string
    author: string
    date: string
    subject: string
    message: string
    tag: string | null
}

export interface ServerUpdateManagerStateGitRepo {
    name: string
    configured_type: string
    detected_type: string
    channel: string
    need_channel_update: boolean
    pristine: boolean
    owner: string
    branch: string
    remote_alias: string
    version: string
    remote_version: string
    full_version_string: string
    current_hash: string
    remote_hash: string
    is_valid: boolean
    is_dirty: boolean
    detached: boolean
    debug_enabled: boolean
    commits_behind: ServerUpdateManagerStateGitRepoCommits[]
    git_messages: string[]
    info_tags: string[]
}

export interface ServerUpdateManagerStateGitRepoGroupedCommit {
    date: Date
    commits: ServerUpdateManagerStateGitRepoCommits[]
}

export interface ServerUpdateManagerStateWebRepo {
    channel: string
    configured_type: 'web' | 'web_beta'
    name: string
    owner: string
    version: string
    remote_version: string
    info_tags: string[]
    last_error: string
}

export interface ServerUpdateManagerStateGuiList {
    name: string
    type: 'git' | 'web'
    data: ServerUpdateManagerStateGitRepo | ServerUpdateManagerStateWebRepo
}
