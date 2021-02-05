import React from 'react';

import MatrixVisualization from '../components/morpheus/MatrixVisualization';
import { CoverageToolbar } from '../components/morpheus/Toolbar';
import { useMorpheusController } from '../hooks/MorpheusController';

import styles from './Morpheus.module.scss';


const useLoading = (Component, LoadingComponent = <div />) => {
    return (props) => props.isLoading ? LoadingComponent : <Component {...props} />;
}

// TODO Style this component to have the text in the middle of the screen.
const MatrixVisualizationWithLoading = useLoading(
    MatrixVisualization,
    <div className={styles.onLoadDiv}>
        <p>Please select a project using the toolbar on the right.</p>
    </div>
)

const Morpheus = () => {
    const [
        coverage,
        selectedProject,
        onUpdateState,
        onUndo,
        onRedo,
        onReset,
        projectDispatch
    ] = useMorpheusController();

    return (
        <>
            <div className={styles.twoColumn}>
            <MatrixVisualizationWithLoading

                isLoading={selectedProject.isLoading}
                x={coverage.x}
                y={coverage.y}
                edges={coverage.edges}
                onMethodClick={ console.log }
                onTestClick={ console.log }
                xlabel={"methods"}
                ylabel={"test cases"} />
            </div>
            <CoverageToolbar
                updateProject={(project, commit) => projectDispatch({ type: 'COVERAGE', project: project, commit: commit })}
                
                setSortingMethod={onUpdateState}
                addFilter={onUpdateState}

                onReset={onReset}

                onUndo={onUndo}
                onRedo={onRedo}
            />
        </>
    );
};

export default Morpheus;
