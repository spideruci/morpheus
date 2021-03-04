import { useReducer } from 'react';

const HISTORY_ACTIONS = {
    redo: 'REDO',
    undo: 'UNDO',
    reset: 'RESET',
    updateState: 'UPDATE_STATE'
}

const historyReducer = (state, action) => {
    switch (action.type) {
        case HISTORY_ACTIONS.redo: {
            console.debug(HISTORY_ACTIONS.redo);
            if (state.future.length === 0) {
                return state;
            }
            const [newPresent, ...future] = state.future;
            return {
                past: [state.present, ...state.past],
                present: newPresent,
                future
            }
        }
        case HISTORY_ACTIONS.undo: {
            console.debug(HISTORY_ACTIONS.undo);
            const [newPresent, ...past] = state.past;
            return {
                past: past,
                present: newPresent,
                future: [state.present, ...state.future]
            }
        }
        case HISTORY_ACTIONS.reset: {
            console.debug(HISTORY_ACTIONS.reset);
            let newPresent = state.past.length >= 0 ? state.past[0] : state.present;
            return {
                past: [],
                present: newPresent,
                future: []
            }
        }
        case HISTORY_ACTIONS.updateState: {
            console.debug(HISTORY_ACTIONS.updateState, state, action);
            return {
                past: [state.present, ...state.past],
                present: {
                    ...state.present,
                    ...action.state
                },
                future: []
            }
        }
        default: {
            console.error(`Unknown history reducer action: ${action.type}`)
            return {
                past: state.past,
                present: state.present,
                future: state.future
            }
        }
    }

}

const historyState = (state) => {
    return {
        past: [],
        present: state,
        future: []
    };
}

export const useHistoryReducer = (presentState) => {
    let [state, historyDispatch] = useReducer(historyReducer, historyState(presentState));

    const onUndo = () => historyDispatch({ type: HISTORY_ACTIONS.undo })
    const onRedo = () => historyDispatch({ type: HISTORY_ACTIONS.redo })
    const onReset = () => historyDispatch({ type: HISTORY_ACTIONS.reset })
    const onUpdateState = (state) => historyDispatch({ type: HISTORY_ACTIONS.updateState, state: state })

    return {
        present: state.present,
        historyDispatch,
        // onUndo,
        // onRedo,
        // onReset,
        // onUpdateState
    };
}