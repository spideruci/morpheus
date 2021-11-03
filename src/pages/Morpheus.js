import React, { useContext } from 'react';
import { useProcessCoverage } from '../hooks/useProcessCoverage';

import MatrixVisualization from '../components/morpheus/MatrixVisualization';
import { CoverageToolbar, MethodHistoryToolbar, TestHistoryToolbar } from '../components/morpheus/Toolbar';
import { MethodPopover, CommitPopover} from '../components/morpheus/MethodPopover';
import {Edge, Test, Method, Commit} from '../logic/api/MorpheusTypes';

import styles from './Morpheus.module.scss';
import { MorpheusContext } from './MorpheusContext';
import { MORPHEUS_ACTION } from '../hooks/useMorpheusReducer';

import { scalePoint, scaleOrdinal } from 'd3-scale';
import { schemeSet3 } from 'd3-scale-chromatic';


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
        let {x, y, edges} = coverage;

        if ((x.length >= 0 && y.length >= 0 && edges.length > 0) && (x[0].constructor.name === Method.name && y[0].constructor.name === Test.name && edges[0].constructor.name === Edge.name)) {

            let unique_method_packages = new Set(coverage.x.map((method) => method.getPackageName()));
            let unique_tests_packages = new Set(coverage.y.map((test) => test.getPackageName()));

            const colorX = (d) => {
                const scale = scaleOrdinal(schemeSet3).domain(Array.from(unique_method_packages));
                return scale(d);
            }

            const colorY = (d) => {
                const scale = scaleOrdinal(schemeSet3).domain(Array.from(unique_tests_packages));
                return scale(d);
            }

            Edge.prototype.getColor = function () {
                return this.getProperty('test_result') ? '#03C03C' : '#FF1C00'
            };
            Method.prototype.getColor = function () {
                return colorX(this.getPackageName());
            };
            Test.prototype.getColor = function () {
                return colorY(this.getPackageName());
            };
        }
    }

    return (
        <>
            <div className={styles.twoColumn}>
                <MatrixVisualizationWithLoading
                    isLoading={state.isLoading}
                    coverage={coverage}
                    onXClick={ console.log }
                    onYClick={ console.log }
                    onRightClick={(event, label) => {
                        event.preventDefault(); // to prevent regular context menu from appearing

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