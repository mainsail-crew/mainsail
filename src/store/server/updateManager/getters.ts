import { GetterTree } from 'vuex'
import { ServerUpdateManagerState, ServerUpdateManagerStateGuiList } from '@/store/server/updateManager/types'
import { caseInsensitiveSort } from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<ServerUpdateManagerState, any> = {
    getUpdateManagerList(state): ServerUpdateManagerStateGuiList[] {
        const output: ServerUpdateManagerStateGuiList[] = []

        state.git_repos.forEach((repo) => {
            output.push({
                name: repo.name,
                type: 'git',
                data: { ...repo },
            })
        })

        state.web_repos.forEach((repo) => {
            output.push({
                name: repo.name,
                type: 'web',
                data: { ...repo },
            })
        })

        return caseInsensitiveSort(output, 'name')
    },
}
