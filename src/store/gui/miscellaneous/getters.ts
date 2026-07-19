import { GetterTree } from 'vuex'
import { GuiMiscellaneousState } from '@/store/gui/miscellaneous/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiMiscellaneousState, RootState> = {
    getEntryKey:
        (state) =>
        (type: string, name: string): string | undefined => {
            return Object.keys(state.entries).find((key) => {
                const entry = state.entries[key]
                if (!entry) return false

                return entry.type === type && entry.name === name
            })
        },
}
