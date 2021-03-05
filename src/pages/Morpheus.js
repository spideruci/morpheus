import React, { useContext } from 'react';
import { useProcessCoverage } from '../hooks/useProcessCoverage';

import MatrixVisualization from '../components/morpheus/MatrixVisualization';
import { CoverageToolbar, MethodHistoryToolbar, TestHistoryToolbar } from '../components/morpheus/Toolbar';
import MethodPopover from '../components/morpheus/MethodPopover';

import styles from './Morpheus.module.scss';
import { MorpheusContext } from './MorpheusContext';
import { MORPHEUS_ACTION } from '../hooks/useMorpheusReducer';

const useLoading = (Component, LoadingComponent = <div />) => {
    return (props) => props.isLoading ? LoadingComponent : <Component {...props} />;
}

const MatrixVisualizationWithLoading = useLoading(
    MatrixVisualization,
    <div className={styles.onLoadDiv}>
        <p>Please select a project using the toolbar on the right.</p>
    </div>
)

const getLabels = (type) => {
    console.log(type);
    switch (type) {
        case 'COVERAGE':
            return { xLabel: 'Methods', yLabel: 'Tests' }
        case 'TEST_HISTORY':
            return { xLabel: 'Commits', yLabel: 'Methods' }
        case 'METHOD_HISTORY':
            return { xLabel: 'Commits', yLabel: 'Tests' }
        default:
            return { xLabel: null, yLabel: null }
    }
}

const Morpheus = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    const coverage = useProcessCoverage(state);

    //  Get label names
    let {xLabel, yLabel} = state.info.type !== null ? getLabels(state.info.type) : {xLabel: null, yLabel: null}

    const toolbar = {
        'DEFAULT': <CoverageToolbar />,
        'COVERAGE': <CoverageToolbar />,
        'TEST_HISTORY': <TestHistoryToolbar />,
        'METHOD_HISTORY': <MethodHistoryToolbar />,
    }

    const clickHistory = () => {
        // TODO 'state.type: state.pup_up...' is a hack... after parsing the methods this should be done on the object type or something like that.
        dispatch({
            type: MORPHEUS_ACTION.SET_HISTORY,
            state: {
                type: state.pop_up.label.hasOwnProperty('method_decl') ? 'METHOD_HISTORY' : 'TEST_HISTORY',
                info: {
                    label: state.pop_up.label,
                }
            }
        })
    }

    const clickMethod = () => {

    }

    return (
        <>
            <div className={styles.twoColumn}>
                <MatrixVisualizationWithLoading
                    isLoading={state.isLoading}
                    coverage={coverage}
                    onMethodClick={ console.log }
                    onTestClick={ console.log }
                    onRightClick={(event, label) => {
                        event.preventDefault(); // to prevent regular context menu from apppearing

                        dispatch({
                            type: MORPHEUS_ACTION.POP_UP,
                            pop_up: {
                                isVisible: true,
                                label: label,
                                anchor: event.target,
                            }
                        });
                    }}
                    xLabel={xLabel}
                    yLabel={yLabel}
                    />
                <MethodPopover 
                    anchor={state.pop_up.anchor}
                    setAnchor={() => {
                        dispatch({
                            type: MORPHEUS_ACTION.POP_UP,
                            pop_up: {
                                isVisible: false,
                                label: null,
                                anchor: null,
                            }
                        });
                    }}
                    label={state.pop_up.label}
                    project={state.info.project}
                    onFilterClick={console.log}
                    onHistoryClick={clickHistory}
                />
            </div>
            {toolbar[state.info.type]}
        </>
    );
};

export default Morpheus;