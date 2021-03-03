import { useReducer, useEffect } from 'react';
import { fetchCoverage } from '../logic/api/morpheusAPIv2';
// import { fetchCoverage, fetchTestHistory, fetchMethodHistory } from '../logic/api/morpheusAPIv2';

const reducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state };
        
        case "SET_PROJECT": 
            console.log("SET_COMMIT", state, action)
            return {
                ...state,
                info: {
                    ...state.info,
                    project: action.project,
                }
            };

        case "SET_COMMIT":
            console.log("SET_COMMIT", state, action)
            return {
                ...state,
                info: {
                    ...state.info,
                    type: 'COVERAGE',
                    commit: action.commit,
                }
            };

        case "SET_SORT":
            console.log("SET_SORT", state, action)
            return {
                ...state, 
                sort: {
                    ...state.sort,
                    ...action
                }
            }

        case "ADD_FILTER":
            console.log("ADD_FILTER", state, action)
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.filters
                }
            }

        case 'SET_COVERAGE':
            console.log("COVERAGE UPDATE...", action, state)

            return {
                ...state,
                ...action.state,
                coverage: {
                    ...action.state.coverage,
                } 
            };
        default:
            console.error(`Did not expect ${action.type}. Reset to initial state.`)
            return state;
    }
}

export const useMorpheusController = (initialState) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const { type, project, commit } = state.info;

        switch (type) {
            case 'COVERAGE':{
                fetchCoverage(project.key, commit.key)
                    .then(({ methods, tests, edges }) => {
                        dispatch({
                            type: "SET_COVERAGE",
                            state: {
                                isLoading: false,
                                coverage: {
                                    x: methods,
                                    y: tests,
                                    edges: edges
                                }
                            }
                        })
                    })
                    .catch(console.error)
                break;
            }
            case 'TEST_HISTORY':{
                const commits = [];
                const tests = [];
                const edges = [];
                dispatch({
                    type: "SET_COVERAGE",
                    state: {
                        isLoading: false,
                        coverage: {
                            x: commits,
                            y: tests,
                            edges: edges
                        }
                    }
                })
                break;
            }
            case 'METHOD_HISTORY': {
                const commits = [];
                const tests = [];
                const edges = [];
                dispatch({
                    type: "SET_COVERAGE",
                    state: {
                        isLoading: false,
                        coverage: {
                            x: commits,
                            y: tests,
                            edges: edges
                        }
                    }
                })
                break;
            }
            default:
                if (type === null)
                    return;
                console.error(`Unknown type ${type}`);
        }
    }, [
        state.info,
        state.info.project,
        state.info.commit
    ]);

    return [state, dispatch];
};
