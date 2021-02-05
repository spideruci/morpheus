import React, { useState, useEffect, useReducer } from 'react';
import { FunctionMap } from '../../filters/data_processor';

const historyInitialState = () => {
    return {
        functionMap: [new FunctionMap()]
    }
}

const historyReducer = (state, action) => {
    let currentMap = state.functionMap[state.functionMap.length - 1];
    let newMap = new FunctionMap(currentMap);
    switch (action.type) {
        case 'FILTER':
            newMap.add_function(action.filter_type, action.filter);
            return {
                ...state,
                functionMap: state.functionMap.concat(newMap)
            }
        case 'SORT':
            newMap.add_function(action.sort_type, action.sort);
            return {
                ...state,
                functionMap: state.functionMap.concat(newMap)
            }
        case 'NEW_DATA':
            return {
                ...state,
            }
        case 'UNDO':
            return historyInitialState();
        case 'RESET':
            return historyInitialState();
        default:
            return historyInitialState();
    }
}

const useMorpheusHistoryManager = () => {
    let [history, historyDispatch] = useReducer(historyReducer, historyInitialState());

    const onUpdateState = (name, func, args=null) => historyDispatch(
        { type: "UPDATE", name: name, func: func, args: args}
    )

    const onUndo = () => historyDispatch({ type: 'UNDO'})
    const onRedo = () => historyDispatch({ type: 'REDO' })
    const onReset = () => historyDispatch({ type: 'RESET' })

    return [history, onUpdateState, onUndo, onRedo, onReset]
}

export default useMorpheusHistoryManager;