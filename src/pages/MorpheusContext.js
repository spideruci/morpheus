import React, { createContext, useContext } from 'react';
import { useMorpheusController } from '../hooks/useMorpheusReducer'

export const initialState = {
    isLoading: true,
    info: {
        type: null,
        project: null,
        commit: null,
        method: null,
        test: null
    },
    pop_up: {
        isVisible: false,
        label: null,
        anchor: null,
    },
    filters: {},
    sort: {
        x: {
            name: 'NAME',
            func: (a, b) => a.to_string() > b.to_string()
        },
        y: {
            name: 'NAME',
            func: (a, b) => a.to_string() > b.to_string()
        },
    },
    coverage: {
        x: [],
        y: [],
        edges: []
    }
}

export const MorpheusContext = createContext(null);

export const MorpheusProvider = (props) => {
    const [state, dispatch] = useMorpheusController(initialState);

    return (
        <MorpheusContext.Provider
            value={{
                state: state,
                dispatch: dispatch,
            }}>
            {props.children}
        </MorpheusContext.Provider>
    )
}

export const useMorpheusContext = () => {
    const context = useContext(MorpheusContext);

    if (!context)  {
        throw new Error("useMorpheusContext must be used within a MorpheusProvider");
    }
    return context;
}