import { useReducer, useEffect } from 'react';
import { fetchCoverage, fetchTestHistory, fetchMethodHistory } from '../logic/api/morpheusAPIv2';
import { historyReducer } from './useHistoryReducer';
import { Edge, Method, Test, Commit } from '../logic/api/MorpheusTypes';

export const MORPHEUS_ACTION = {
    LOADING: 'LOADING',
    RESET: 'RESET',

    SET_PROJECT: 'SET_PROJECT',
    SET_COMMIT: 'SET_COMMIT',
    SET_METHOD_HISTORY: 'SET_METHOD_HISTORY',
    SET_TEST_HISTORY: 'SET_TEST_HISTORY',

    SET_SORT: 'SET_SORT',
    ADD_FILTER: 'ADD_FILTER',

    SET_COVERAGE: 'SET_COVERAGE',

    POP_UP: 'POP_UP'
}

const morpheusReducer = (state, action) => {
    console.log("MORPHEUS REDUCER", state, action);
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
        case MORPHEUS_ACTION.SET_METHOD_HISTORY:{
            let info = {
                type: 'METHOD_HISTORY',
                method: action.state.info.label,
                project: state.info.project
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
        }
        case MORPHEUS_ACTION.SET_TEST_HISTORY:{
            let info = {
                type: 'TEST_HISTORY',
                test: action.state.info.label,
                project: state.info.project
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

            let x_func = {
                name: 'NAME',
                func: (a, b) => a.toString() > b.toString()
            }
            const y_func = {
                name: 'NAME',
                func: (a, b) => a.toString() > b.toString()
            }

            if ((state.info.type === 'METHOD_HISTORY') || (state.info.type === 'TEST_HISTORY')) {
                x_func ={
                    name: 'DATE',
                    func: (a, b) => a.getDate() > b.getDate()
                }
            }

            let new_state = {
                ...state,
                ...action.state,
                coverage: {
                    ...action.state.coverage,
                },
                sort: {
                    x: x_func,
                    y: y_func,
                },
                pop_up: {
                    isVisible: false,
                    label: null,
                    anchor: null,
                }
            };
            return new_state

        case MORPHEUS_ACTION.RESET:
            console.log(MORPHEUS_ACTION.RESET, action, state)
            return {
                ...state,
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
            };
        case MORPHEUS_ACTION.POP_UP:
            console.log(MORPHEUS_ACTION.POP_UP, action, state)
            return {
                ...state,
                pop_up: {
                    ...action.pop_up
                }
            }
        default:
            console.log('DEFAULT RETURN state', state);
            return state;
    }
}

const parseCoverage = ({methods, tests, edges}) => {
    return {
        x: methods.map((m) => new Method(m.id, m.package_name, m.class_name, m.method_name, m.method_decl, m.file_path)),
        y: tests.map((t) => new Test(t.id, t.package_name, t.class_name, t.method_name)),
        edges: edges.map((e) => new Edge(e.method_id, e.test_id, { test_result: e.test_result})),
    }
}

const parseMethodHistory = ({ commits, tests, edges }) => {
    return {
        x: commits.map((c) => new Commit(c.id, c.sha, c.datetime, c.author)),
        y: tests.map((t) => new Test(t.id, t.package_name, t.class_name, t.method_name)),
        edges: edges.map((e) => new Edge(e.commit_id, e.test_id, { test_result: e.test_result })),
    }
}

const parseTestHistory = ({ methods, commits, edges }) => {
    return {
        x: commits.map((c) => new Commit(c.id, c.sha, c.datetime, c.author)),
        y: methods.map((m) => new Method(m.id, m.package_name, m.class_name, m.method_name, m.method_decl, m.file_path)),
        edges: edges.map((e) => new Edge(e.commit_id, e.method_id, { test_result: e.test_result })),
    }
}


export const useMorpheusController = (initialState) => {

    const [intialState, reducer] = historyReducer(morpheusReducer, initialState);
    const [state, dispatch] = useReducer(reducer, intialState);
    const { present } = state;

    useEffect(() => {
        const { type, project } = present.info;
        switch (type) {
            case 'COVERAGE':{
                const { commit } = present.info;

                fetchCoverage(project.getID(), commit.getID())
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
                const { test } = present.info;
                fetchTestHistory(project.getID(), test.getID())
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
                const { method } = present.info;
                fetchMethodHistory(project.getID(), method.getID())
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
            present.info,
            present.info.project,
            present.info.commit
    ]);

    return [state, dispatch];
};
