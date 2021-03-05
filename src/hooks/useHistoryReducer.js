const HISTORY_ACTIONS = {
    redo: 'REDO',
    undo: 'UNDO',
    reset: 'RESET'
}

export const historyReducer = (reducer, initialState) => {
    const historyState = {
        past: [],
        present: initialState,
        future: []
    }

    const combinedReducer = (state = historyState, action) => {
        const { past, present, future } = state;

        switch (action.type) {
            case HISTORY_ACTIONS.undo: {
                const [newPresent, ...newPast] = past;
                return {
                    past: newPast,
                    present: newPresent,
                    future: [present, ...future]
                }
            }

            case HISTORY_ACTIONS.redo: {
                const [newPresent, ...newFuture] = future;
                return {
                    past: [present, ...past],
                    present: newPresent,
                    newFuture
                }
            }

            case HISTORY_ACTIONS.reset: {
                let newPresent = past.length >= 0 ? past[0] : present;
                return {
                    past: [],
                    present: newPresent,
                    future: []
                }
            }
            default: {
                const newPresent = reducer(present, action)
                if (present === newPresent) {
                    return state;
                }
                return {
                    past: [present, ...past],
                    present: newPresent,
                    future: []
                }
            }
        }
    }

    return [historyState, combinedReducer];
}