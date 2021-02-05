import { useState, useEffect, useReducer } from 'react';
import { process_data, FunctionMap } from '../logic/filters/data_processor'
import { fetchCoverage } from '../logic/api/morpheusAPIv2';

const initialState = () => {
    return {
        type: 'LOADING',
        isLoading: true,
    }
}

const reducer = (state, action) => {
    console.debug('reducer', action, state);

    switch (action.type) {
        case 'COVERAGE':
            return {
                type: 'COVERAGE',
                project: action.project,
                commit: action.commit,
                isLoading: false,
            };
        case 'METHOD_HISTORY':
            return {
                type: 'METHOD_HISTORY',
                project: action.project,
                method: action.method,
                isLoading: false,
            }
        case 'TEST_HISTORY':
            return {
                type: 'TEST_HISTORY',
                project: action.project,
                test: action.test,
                isLoading: false,
            }
        default:
            console.error(`Did not expect ${action.type}. Reset to initial state.`)
            return initialState();
    }
}

export const useMorpheusController = () => {
    let [coverageMatrix, setCoverageMatrix] = useState({
        x: [],
        y: [],
        edges: []
    });

    let [visualizationData, setVisualizationData] = useState({
        x: [],
        y: [],
        edges: []
    });

    let [history, onUpdateState, onUndo, onRedo, onReset] = useMorpheusHistoryManager();
    let [selectedProject, projectDispatch] = useReducer(reducer, initialState());

    //  Upon changing the selected commit, retrieve coverage data.
    useEffect(() => {
        const isEmpty = (obj) => obj === undefined || (Object.keys(obj).length === 0 && obj.constructor === Object);

        if (isEmpty(selectedProject.project) || isEmpty(selectedProject.commit)) {
            return;
        }

        fetchCoverage(selectedProject.project.key, selectedProject.commit.key)
            .then((data) => {
                if (data === undefined) {
                    console.error("Data undefined...")
                    return;
                }
                setCoverageMatrix({
                    x: data.methods,
                    y: data.tests,
                    edges: data.edges
                })
            })
            .catch(console.error);

    }, [selectedProject])

    //  Process coverage information when the function map or the coverage matrix changes.
    useEffect(() => {
        const functionMap = history.functionMap[history.functionMap.length - 1];
        const newVisualizationData = process_data(coverageMatrix, functionMap);

        setVisualizationData(newVisualizationData);
    }, [history.functionMap, coverageMatrix]);

    return [
        visualizationData,
        selectedProject,
        onUpdateState,
        onUndo,
        onRedo,
        onReset,
        projectDispatch
    ];
};


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
