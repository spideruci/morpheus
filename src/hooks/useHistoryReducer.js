export const HISTORY_ACTION = {
    REDO: 'REDO',
    UNDO: 'UNDO',
    RESET: 'RESET'
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
            case HISTORY_ACTION.UNDO: {
                const [newPresent, ...newPast] = past;

                // First, is project selection, Second, commit selection, and 3 is setting coverage.
                // TODO: Should be wrapped into one.
                if (past.length === 3) {
                    console.warn("No more history state")
                    return state;
                }
                return {
                    past: newPast,
                    present: newPresent,
                    future: [present, ...future]
                }
            }

            case HISTORY_ACTION.REDO: {
                if (future.length < 1) {
                    console.warn("No more future states to apply.")
                    return state;
                }
                const [newPresent, ...newFuture] = future;
                return {
                    past: [present, ...past],
                    present: newPresent,
                    future: newFuture
                }
            }

            case HISTORY_ACTION.RESET: {
                console.log("RESET", state);
                if (past.length <= 3) {
                    console.warn("No state to return yet.", state);
                    return state
                }

                const newPast = past.slice(past.length-3 -1, past.length-1)
                const newPresent = past[past.length - 3 -1];

                return {
                    past: newPast,
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