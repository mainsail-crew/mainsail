export interface DraggableChangeEvent<T = unknown> {
    added?: {
        element: T
        newIndex: number
    }
    removed?: {
        element: T
        oldIndex: number
    }
    moved?: {
        element: T
        oldIndex: number
        newIndex: number
    }
}

export interface DraggableEndEvent {
    oldIndex: number
    newIndex: number
}
