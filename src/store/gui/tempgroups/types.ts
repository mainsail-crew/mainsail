export interface GuiTempgroupsState {
    showAllTab: boolean
    activeGroupId: string | null
    groups: {
        [key: string]: GuiTempgroup
    }
}

export interface GuiTempgroup {
    id: string
    name: string
    position: number
    color?: string
    showChart: boolean
    sensors: GuiTempgroupSensor[]
}

export interface GuiTempgroupSensor {
    pos: number
    name: string
    displayName?: string
}
