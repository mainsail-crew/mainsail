import { SocketState } from '@/store/socket/types'
import { ServerState } from '@/store/server/types'
import { PrinterState } from '@/store/printer/types'
import { GuiState } from '@/store/gui/types'
import {EditorState} from "@/store/editor/types";

export interface RootState {
    packageVersion: String
    debugMode: Boolean
    naviDrawer: Boolean

    socket?: SocketState
    gui?: GuiState
    printer?: PrinterState
    server?: ServerState
    editor?: EditorState
}