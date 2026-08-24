export interface TodoItem {
    id: string
    text: string
    done: boolean
}

export interface Note {
    id: string
    title: string
    todos: TodoItem[]
    updatedAt: number
}

export interface NoteDraft {
    title: string
    todos: TodoItem[]
}


export type DialogKind = 'cancel' | 'delete' | null

export interface ToastMessage {
    id: string
    text: string
    type: 'success' | 'error'
}