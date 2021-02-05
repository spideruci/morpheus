import React, {useState, useEffect, useReducer} from 'react';
import { FunctionMap, process_data } from '../../filters/data_processor';
import { fetchCoverage } from '../../logic/morpheusAPI';
import MatrixVisualization from '../../visualizations/MatrixVisualization';

import { CoverageToolbar } from './Toolbar';

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

const historyInitialState = () => {
    return {
        functionMap: [new FunctionMap()]
    }
}

const historyReducer = (state, action) => {
    let currentMap = state.functionMap[state.functionMap.length - 1];
    let newMap = new FunctionMap(currentMap);
    switch(action.type) {
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
        case 'BACK':
            return historyInitialState();
        case 'RESET':
            return historyInitialState();
        default:
            return historyInitialState();
    }
}

const useMorpheusController = () => {
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

    let [history, historyDispatch] = useReducer(historyReducer, historyInitialState());
    let [selectedProject, projectDispatch] = useReducer(reducer, initialState());

    //  Upon changing the selected commit, retrieve coverage data.
    useEffect(() => {
        const isEmpty = (obj) => obj === undefined || (Object.keys(obj).length === 0 && obj.constructor === Object);

        if (isEmpty(selectedProject.project) || isEmpty(selectedProject.commit)) {
            return;
        }

        fetchCoverage(selectedProject.project.value, selectedProject.commit.value)
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
        historyDispatch,
        projectDispatch
    ];
};

const useLoading = (Component, LoadingComponent = <div />) => {
    return (props) => props.isLoading ? LoadingComponent : <Component {...props} />;
}

const MatrixVisualizationWithLoading = useLoading(
    MatrixVisualization,
    <div>Please select a project using the toolbar.</div>
)

const Morpheus = () => {
    const [coverage, selectedProject, historyDispatch, projectDispatch] = useMorpheusController();

    return (
        <div className='test-visualization'>
            <MatrixVisualizationWithLoading
                isLoading={selectedProject.isLoading}
                x={coverage.x}
                y={coverage.y}
                edges={coverage.edges}
                xlabel={"methods"}
                ylabel={"test cases"} />

            <CoverageToolbar
                updateProject={(project, commit) => projectDispatch({ type: 'COVERAGE', project: project, commit: commit })}

                setSortingMethod={(sort_type, sort) => historyDispatch({ type: 'SORT', sort_type: sort_type, sort: sort })}

                addFilter={(filter_type, filter, args) => historyDispatch({ type: 'FILTER', filter_type: filter_type, filter: filter, args: args })}

                onReset={() => historyDispatch({ type: 'RESET' })}

                onBack={() => historyDispatch({ type: 'BACK' })}
            />
        </div>
    );
};

export default Morpheus;
