export interface GuiRemindersState {
    reminders: {
        [key: string]: GuiRemindersStateReminder
    }
}

export interface GuiRemindersStateReminder {
    id: string
    name: string
    start_total_print_time: number
    time_delta: number
    time_remaining?: number
}
