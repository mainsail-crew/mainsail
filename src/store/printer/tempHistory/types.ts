export interface PrinterTempHistoryState {
    source: PrinterTempHistoryStateSourceEntry[]
    series: PrinterTempHistoryStateSerie[]
    timeLastUpdate: number | null
    updateSourceInterval: number | null
}

export interface PrinterTempHistoryStateSerie {
    id: number
    color: string
    type: string
    name: string
    yAxisIndex: number
    encode: {
        x: string
        y: string
    }
    animation: boolean
    lineStyle: {
        color: string
        width: number
        opacity: number
        type?: string
    }
    areaStyle?: {
        color: string
        opacity: number
    }
    showSymbol: boolean
    axisPointer?: {
        show: boolean
    }
    markPoint?: {
        symbol: string
        symbolSize: number
        label: { show: boolean }
        itemStyle: {
            color: string
        }
        data: { coord: [Date, number] }[]
    }
    emphasis: {
        lineStyle: {
            color: string
            width: number
            opacity: number
            type?: string
        }
        areaStyle?: {
            color: string
            opacity: number
        }
    }
}

export interface PrinterTempHistoryStateSourceEntry {
    date: Date
    [key: string]: Date | number | null
}
