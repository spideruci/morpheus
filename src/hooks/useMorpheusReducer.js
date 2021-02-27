import { useReducer } from 'react';
import { process_data, FunctionMap } from '../logic/filters/data_processor'



const getLabels  = (type) => {
    switch(type) {
        case 'COVERAGE':
            return {xLabel: 'Methods', yLabel: 'Tests'}
        case 'TEST_HISTORY':
            return { xLabel: 'Commits', yLabel: 'Methods' }
        case 'METHOD_HISTORY':
            return { xLabel: 'Commits', yLabel: 'Tests' }
        default:
            console.error(`Unknown label type: ${type}`)
            return { xLabel: null, yLabel: null }
    }
}

const sortCoverage = (x, y, edges, state) => {

    return {
        x: [...x].sort(state.sort_x),
        y: [...y].sort(state.sort_y),
        edges: edges
    }
}

const reducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state };
        case'COVERAGE':
            console.log("COVERAGE UPDATE...")

            let newState = {
                ...state,
                ...action.state,
            }

            if ((action.state.coverage === undefined) && state.isLoading) {
                return newState;
            }
            

            let coverage = action.state.hasOwnProperty('coverage') ? action.state.coverage : state.coverage;

            let processedCoverage = sortCoverage(coverage.x, coverage.y, coverage.edges, state);

            return {
                ...newState,
                coverage: {
                    ...processedCoverage,
                    ...getLabels(state.info.type)
                } 
            };

        default:
            console.error(`Did not expect ${action.type}. Reset to initial state.`)
            return state;
    }
}

export const useMorpheusController = (state) => {
    let [morpheusState, morpheusDispatch] = useReducer(reducer, state);

    return [
        morpheusState,
        morpheusDispatch,
    ];
};
