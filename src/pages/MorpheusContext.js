import React, { createContext, useContext } from 'react';
import { useMorpheusController } from '../hooks/useMorpheusReducer'

export const initialState = {

    isLoading: true,
    info: {
        type: 'DEFAULT',
        project: null,
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
            func: (a, b) => a.toString() > b.toString()
        },
        y: {
            name: 'NAME',
            func: (a, b) => a.toString() > b.toString()
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
                state: state.present,
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