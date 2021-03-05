import { useReducer, useEffect } from 'react';
import { fetchCoverage, fetchTestHistory, fetchMethodHistory } from '../logic/api/morpheusAPIv2';

export const MORPHEUS_ACTION = {
    LOADING: 'LOADING',
    RESET: 'RESET',

    SET_PROJECT: 'SET_PROJECT',
    SET_COMMIT: 'SET_COMMIT',
    SET_HISTORY: 'SET_HISTORY',

    SET_SORT: 'SET_SORT',
    ADD_FILTER: 'ADD_FILTER',

    SET_COVERAGE: 'SET_COVERAGE',

    POP_UP: 'POP_UP'
}

const reducer = (state, action) => {
    switch (action.type) {
        case MORPHEUS_ACTION.LOADING:
            return { ...state };
        case MORPHEUS_ACTION.SET_PROJECT: 
            console.log(MORPHEUS_ACTION.SET_PROJECT, state, action)
            return {
                ...state,
                info: {
                    ...state.info,
                    project: action.project,
                }
            };

        case MORPHEUS_ACTION.SET_COMMIT:
            console.log(MORPHEUS_ACTION.SET_COMMIT, state, action)
            return {
                ...state,
                info: {
                    ...state.info,
                    type: 'COVERAGE',
                    commit: action.commit,
                }
            };

        case MORPHEUS_ACTION.SET_HISTORY:
            let info;
            if (action.state.type ===  'TEST_HISTORY') {
                info = {
                    type: action.state.type,
                    test: action.state.info.label,
                    project: state.info.project
                }
            } else {
                info = {
                    type: 'METHOD_HISTORY',
                    method: action.state.info.label,
                    project: state.info.project
                }
            }

            return {
                ...state,
                info: {
                    ...info
                },
                pop_up: {
                    isVisible: false,
                    label: null,
                    anchor: null,
                }
            }

        case MORPHEUS_ACTION.SET_SORT:
            console.log(MORPHEUS_ACTION.SET_SORT, state, action)
            return {
                ...state, 
                sort: {
                    ...state.sort,
                    ...action
                }
            }

        case MORPHEUS_ACTION.ADD_FILTER:
            console.log(MORPHEUS_ACTION.ADD_FILTER, state, action)
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.filters
                }
            }

        case MORPHEUS_ACTION.SET_COVERAGE:
            console.log(MORPHEUS_ACTION.SET_COVERAGE, action, state)
            return {
                ...state,
                ...action.state,
                coverage: {
                    ...action.state.coverage,
                } 
            };

        case MORPHEUS_ACTION.RESET:
            console.log(MORPHEUS_ACTION.RESET, action, state)
            console.log("RESET STATE", {
                ...state,
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
            })
            return {
                ...state,
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
            };
        case MORPHEUS_ACTION.POP_UP:
            console.log(MORPHEUS_ACTION.POP_UP, action, state)
            console.log("NEW_STATE", {
                ...state,
                pop_up: {
                    ...action.pop_up
                }
            })
            return {
                ...state,
                pop_up: {
                    ...action.pop_up
                }
            }
        default:
            console.error(`Did not expect ${action.type}. Reset to initial state.`)
            return state;
    }
}

const parseCoverage = ({methods, tests, edges}) => {
    return {
        x: methods,
        y: tests,
        edges: edges
    }
}

const parseMethodHistory = ({ commits, tests, edges }) => {
    return {
        x: commits,
        y: tests,
        edges: edges
    }
}

const parseTestHistory = ({ methods, commits, edges }) => {
    console.log("parse test history: ", methods, commits, edges)
    return {
        x: commits,
        y: methods,
        edges: edges
    }
}


export const useMorpheusController = (initialState) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const { type, project } = state.info;
        switch (type) {
            case 'COVERAGE':{
                const { commit } = state.info;

                fetchCoverage(project.key, commit.key)
                    .then(parseCoverage)
                    .then((coverage) => {
                        dispatch({
                            type: MORPHEUS_ACTION.SET_COVERAGE,
                            state: {
                                isLoading: false,
                                coverage: coverage
                            }
                        })
                    })
                    .catch(console.error);
                break;
            }
            case 'TEST_HISTORY':{
                const { test } = state.info;
                fetchTestHistory(project.key, test.get_id())
                    .then(parseTestHistory)
                    .then((coverage) => {
                        dispatch({
                            type: MORPHEUS_ACTION.SET_COVERAGE,
                            state: {
                                isLoading: false,
                                coverage: coverage
                            }
                        })
                    })
                    .catch(console.error);
                break;
            }
            case 'METHOD_HISTORY': {
                const { method } = state.info;
                fetchMethodHistory(project.key, method.get_id())
                    .then(parseMethodHistory)
                    .then((coverage) => {
                        dispatch({
                            type: MORPHEUS_ACTION.SET_COVERAGE,
                            state: {
                                isLoading: false,
                                coverage: coverage
                            }
                        })
                    })
                    .catch(console.error);
                break;
            }
            default:
                return;
        }
    }, [
        state.info,
        state.info.project,
        state.info.commit
    ]);

    return [state, dispatch];
};
