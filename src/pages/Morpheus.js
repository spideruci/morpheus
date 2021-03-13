import React, { useContext } from 'react';
import { useProcessCoverage } from '../hooks/useProcessCoverage';

import MatrixVisualization from '../components/morpheus/MatrixVisualization';
import { CoverageToolbar, MethodHistoryToolbar, TestHistoryToolbar } from '../components/morpheus/Toolbar';
import { MethodPopover, CommitPopover} from '../components/morpheus/MethodPopover';
import {Edge, Test, Method, Commit} from '../logic/api/MorpheusTypes';

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
            return { xLabel: null, yLabel: null }
    }
}

const getPopover = (state, dispatch, onFilterClick, onHistoryClick) => {
    let popover = null;
    let label = state.pop_up.label

    if ((label === undefined) || (label === null)) {
        return;
    }

    if (label.constructor.name === 'Commit') {
        popover = <CommitPopover
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
            commit={label}
            project={state.info.project}
            onFilterClick={onFilterClick}
            onHistoryClick={onHistoryClick}
        />
    } else {
        popover = <MethodPopover
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
            method={label}
            project={state.info.project}
            onFilterClick={onFilterClick}
            onHistoryClick={onHistoryClick}
        />
    }

    return popover;
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
        const label_type = state.pop_up.label.constructor.name;
        if (label_type === Method.name) {
            dispatch({
                type: MORPHEUS_ACTION.SET_METHOD_HISTORY,
                state: {
                    type: 'METHOD_HISTORY',
                    info: {
                        label: state.pop_up.label,
                    }
                }
            })
        }
        else if (label_type === Test.name) {
            dispatch({
                type: MORPHEUS_ACTION.SET_TEST_HISTORY,
                state: {
                    type: 'TEST_HISTORY',
                    info: {
                        label: state.pop_up.label,
                    }
                }
            })
        }
        else if (label_type === Commit.name) {
            dispatch({
                type: MORPHEUS_ACTION.SET_COMMIT,
                commit: state.pop_up.label,
            })
        }
    }

    if ((state.info.type === 'TEST_HISTORY')) {
        // TODO change this idea to make it work for all options.
        Edge.prototype.getColor = function () { return this.getProperty('test_result') ? '#03C03C' : '#FF1C00' };
    } else if (state.info.type === 'METHOD_HISTORY') {
        Edge.prototype.getColor = function () { return this.getProperty('test_result') ? '#03C03C' : '#FF1C00' };
    } else if (state.info.type === 'COVERAGE') {
        Edge.prototype.getColor = function(){ return this.getProperty('test_result') ? '#03C03C' : '#FF1C00'};
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
                    // getColorEdge={getColorEdge}
                    // getColorX={getColorX}
                    // getColorY={getColorY}
                    />
                {getPopover(state, dispatch, console.log, clickHistory)}
            </div>
            {toolbar[state.info.type]}
        </>
    );
};

export default Morpheus;