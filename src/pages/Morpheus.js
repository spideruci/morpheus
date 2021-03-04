import React, { useContext, useState } from 'react';
import { useProcessCoverage } from '../hooks/useProcessCoverage';

import MatrixVisualization from '../components/morpheus/MatrixVisualization';
import { CoverageToolbar } from '../components/morpheus/Toolbar';
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
    switch (type) {
        case 'COVERAGE':
            return { xLabel: 'Methods', yLabel: 'Tests' }
        case 'TEST_HISTORY':
            return { xLabel: 'Commits', yLabel: 'Methods' }
        case 'METHOD_HISTORY':
            return { xLabel: 'Commits', yLabel: 'Tests' }
        default:
            console.error(`Unknown label type: ${type}`)
            return { xLabel: null, yLabel: null }
    }
}

const Morpheus = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    const coverage = useProcessCoverage(state);

    //  Get label names
    let {xLabel, yLabel} = state.info.type !== null ? getLabels(state.info.type) : {xLabel: null, yLabel: null}

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
                                currentMethod: label.to_string(),
                                anchor: event.target,
                                current_method_id: label.get_id()
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
                                currentMethod: "",
                                anchor: null,
                                current_method_id: -1
                            }
                        });
                    }}
                    currentMethod={state.pop_up.currentMethod}
                    currentProject={state.info.project}
                    onMethodClick={console.log}
                    onHistoryClick={console.log}
                />
            </div>
            <CoverageToolbar/>
        </>
    );
};

export default Morpheus;