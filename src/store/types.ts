import { SocketState } from '@/store/socket/types'
import { ServerState } from '@/store/server/types'
import { PrinterState } from '@/store/printer/types'
import { GuiState } from '@/store/gui/types'
import {EditorState} from '@/store/editor/types'

export interface RootState {
    packageVersion: string
    debugMode: boolean
    naviDrawer: boolean | null

    socket?: SocketState
    gui?: GuiState
    printer?: PrinterState
    server?: ServerState
    editor?: EditorState
}

export interface RootStateDependency {
    serviceName: string,
    installedVersion: string,
    neededVersion: string
}