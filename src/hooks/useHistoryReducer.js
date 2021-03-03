import { useReducer, useEffect } from 'react';

export const historyActions = {
    redo: 'REDO',
    undo: 'UNDO',
    reset: 'RESET',
    updateState: 'UPDATE_STATE'
}

const historyReducer = (state, action) => {

    switch (action.type) {
        case historyActions.redo: {
            console.debug(historyActions.redo);
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
        case historyActions.undo: {
            console.debug(historyActions.undo);
            const [newPresent, ...past] = state.past;
            return {
                past: past,
                present: newPresent,
                future: [state.present, ...state.future]
            }
        }
        case historyActions.reset: {
            console.debug(historyActions.reset);
            let newPresent = state.past.length >= 0 ? state.past[0] : state.present;
            return {
                past: [],
                present: newPresent,
                future: []
            }
        }
        case historyActions.updateState: {
            console.debug(historyActions.updateState, state, action);
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

const initialState = (state) => {
    return {
        past: [],
        present: state,
        future: []
    };
}

export const useHistoryReducer = (presentState) => {
    let [currentState, historyDispatch] = useReducer(historyReducer, initialState(presentState));

    return [currentState, historyDispatch]
}