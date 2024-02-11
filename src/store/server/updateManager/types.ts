export interface ServerUpdateManagerState {
    busy: boolean
    github_rate_limit: number | null
    github_requests_remaining: number | null
    github_limit_reset_time: number | null
    git_repos: ServerUpdateManagerStateGitRepo[]
    web_repos: ServerUpdateManagerStateGitRepo[]
    system: {
        package_count: number
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

export interface ServerUpdateManagerStateGitRepoCommit {
    sha: string
    author: string
    date: string
    subject: string
    message: string
    tag: string | null
}

export interface ServerUpdateManagerStateGitRepo {
    name: string
    repo_name?: string
    configured_type: string
    detected_type?: string
    channel?: string
    need_channel_update?: boolean
    pristine?: boolean
    owner: string
    branch?: string
    remote_alias?: string
    version: string
    remote_version: string
    full_version_string?: string
    current_hash?: string
    remote_hash?: string
    is_valid?: boolean
    is_dirty?: boolean
    corrupt?: boolean
    detached?: boolean
    debug_enabled?: boolean
    commits_behind?: ServerUpdateManagerStateGitRepoCommit[]
    git_messages?: string[]
    anomalies?: string[]
    warnings?: string[]
    info_tags?: string[]
    recovery_url?: string
}

export interface ServerUpdateManagerStateGitRepoGroupedCommits {
    date: Date
    commits: ServerUpdateManagerStateGitRepoCommit[]
}

export interface ServerUpdateManagerStateGuiList {
    name: string
    type: 'git' | 'web'
    data: ServerUpdateManagerStateGitRepo
}
