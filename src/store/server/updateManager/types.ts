export interface ServerUpdateMangerState {
    version_info: any
    updateResponse: {
        application: string,
        complete: boolean,
        messages: ServerUpdateMangerStateMessages[],
    }
}

export interface ServerUpdateMangerStateMessages {
    date: Date
    message: string
}