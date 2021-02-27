import React, { useEffect } from 'react';

import MatrixVisualization from '../components/morpheus/MatrixVisualization';
import { CoverageToolbar } from '../components/morpheus/Toolbar';
import { useMorpheusController } from '../hooks/useMorpheusReducer';
import { fetchCoverage } from '../logic/api/morpheusAPIv2';
import styles from './Morpheus.module.scss';


const useLoading = (Component, LoadingComponent = <div />) => {
    return (props) => props.isLoading ? LoadingComponent : <Component {...props} />;
}

const MatrixVisualizationWithLoading = useLoading(
    MatrixVisualization,
    <div className={styles.onLoadDiv}>
        <p>Please select a project using the toolbar on the right.</p>
    </div>
)

const initialState = () => {
    return {
        isLoading: true,
        info: {
            type: null,
            project: null,
            commit: null,
            method: null,
            test: null
        },
        filters: {},
        sort_x: (a, b) => a.to_string() > b.to_string(),
        sort_y: (a, b) => a.to_string() > b.to_string(),
        coverage: {
            x: [],
            y: [],
            edges: [],
            xLabel: null,
            yLabel: null
        },
    }
}

const Morpheus = () => {
    const [state, dispatch] = useMorpheusController(initialState());

    useEffect(() => {
        const {type, project, commit} = state.info;

        switch(type) {
            case 'COVERAGE':
                fetchCoverage(project.key, commit.key)
                    .then(({ methods, tests, edges }) => {
                        dispatch({
                            type: "COVERAGE", state: {
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
            default:
                if (type === null)
                    return;
                console.error(`Unknown type ${type}`);
        }
    }, [
        state.info,
        state.info.type,
        state.info.project,
        state.info.commit,
        dispatch
    ])

    return (
        <>
            <div className={styles.twoColumn}>
                <MatrixVisualizationWithLoading
                    isLoading={state.isLoading}
                    coverage={state.coverage}
                    onMethodClick={ console.log }
                    onTestClick={ console.log }
                    xLabel={state.coverage.xLabel}
                    yLabel={state.coverage.yLabel}
                    />
            </div>
            <CoverageToolbar
                onChange={dispatch}
            />
        </>
    );
};

export default Morpheus;