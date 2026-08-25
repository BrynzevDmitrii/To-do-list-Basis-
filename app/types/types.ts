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


export type DialogKind = 'cancel' | 'delete' | 'leave' | null

export interface ToastMessage {
    id: string
    text: string
    type: 'success' | 'error'
}

export interface PersistedNotes {
    version: number
    notes: Note[]
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type Patch =
    | { type: 'same' }
    | { type: 'set'; value: JsonValue }
    | { type: 'object'; changes: Record<string, Patch> }
    | { type: 'array'; length: number; changes: Record<number, Patch> }

export interface HistoryStep {
    undo: Patch
    redo: Patch
}

export interface Draft {
    title: string
    count: number
}