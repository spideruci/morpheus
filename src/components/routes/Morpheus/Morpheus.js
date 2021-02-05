import React, {useState, useEffect, useReducer} from 'react';
import { process_data } from '../../filters/data_processor';
import { fetchCoverage } from '../../logic/morpheusAPI';
import MatrixVisualization from '../../visualizations/MatrixVisualization';
import useMorpheusHistoryManager from './MorpheusController';
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

    const [history, onUpdateState, onUndo, onRedo, onReset] = useMorpheusHistoryManager();

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
                
                setSortingMethod={onUpdateState}
                addFilter={onUpdateState}

                onReset={onReset}

                onUndo={onUndo}
                onRedo={onRedo}
            />
        </div>
    );
};

export default Morpheus;
