import React, {useEffect, useState} from 'react';
import { fetchProjects, fetchCommits } from '../../logic/api/morpheusAPIv2';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import styles from './Toolbar.module.scss';

// Accordion
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Button from '@material-ui/core/Button';

import Menu from '../../components/common/Menu';
import { useHistoryReducer } from '../../hooks/useHistoryReducer';

import {
    sort_by_cluster_X,
    sort_by_cluster_Y,
    sort_by_coverage_X,
    sort_by_coverage_Y,
    sort_by_suspciousness
} from '../../logic/filters/sorting';

const ToolBar = (props) => {
    return (
        <div className={styles.toolbar}>
            <h4>Toolbar</h4>
            { props.children }
            <Button onClick={props.onUndo}>Undo</Button>
            <Button onClick={props.onRedo}>Redo</Button>
            <Button onClick={props.onReset}>Reset</Button>
        </div>
    )
}

export const CoverageToolbar = ({onChange}) => {

    const [
        state,
        onUndo,
        onRedo,
        onReset,
        onNewState
    ] = useHistoryReducer({});

    useEffect(() => {
        onChange({ type: "COVERAGE", state: state.present });
    }, [onChange, state])

    return (
        <ToolBar
            onUndo={onUndo}
            onRedo={onRedo}
            onReset={onReset}>
            <ProjectSelectors onChange={onNewState} />
            <CoverageSorter onChange={onNewState} />
            {/* <MethodFilter onChange={onNewState} />
            <TestFilter onChange={onNewState} /> */}
        </ToolBar>
    )
}

const ProjectSelectors = ({onChange}) => {

    let [project, setProject] = useState('')

    let [projectList, setProjectList] = useState([])
    let [commitList, setCommitList] = useState([])

    useEffect(() => {
        fetchProjects()
            .then(setProjectList)
            .catch(console.error)
    }, [])

    const projectSelect = ({ target }) => {
        const projectName = target.innerHTML;

        const project = projectList.find((p) => p.value === projectName);

        setProject(project)

        fetchCommits(project.key)
            .then(setCommitList)
            .catch((err) => {
                console.error(err);
                setCommitList([])
            })
    }

    return (
        <Accordion >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Project selector</span>
            </AccordionSummary>

            <AccordionDetails className="accordion-block">
                <Autocomplete
                    id="project-menu"
                    disableClearable={true}
                    options={projectList}
                    getOptionLabel={(option) => option.value}
                    // style={{ width: 300 }}
                    onChange={projectSelect}
                    renderInput={(params) => <TextField {...params} label="Projects..." variant="outlined" />}
                />
                <Autocomplete
                    id="commit-menu"
                    disableClearable={true}
                    disabled={commitList.length === 0}
                    options={commitList}
                    getOptionLabel={(option) => option.value}
                    // style={{ width: 300 }}
                    onChange={({ target }) => {
                        const commitSha = target.innerHTML;

                        const commit = commitList.find((p) => p.value === commitSha);

                        onChange({ info: { type: 'COVERAGE', project: project, commit: commit}});
                    }}
                    renderInput={(params) => <TextField {...params} label="Commits..." variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const CoverageSorter = ({ onChange }) => {

    const SORT_MAP_X = {
        ID: (a, b) => a.get_id() > b.get_id(),
        NAME: (a, b) => a.to_string() > b.to_string(),
    };

    const SORT_KEYS_X = Object.keys(SORT_MAP_X);

    const SORT_MAP_Y = {
        ID: (a, b) => a.get_id() > b.get_id(),
        NAME: (a, b) => a.to_string() > b.to_string(),
    };

    const SORT_KEYS_Y = Object.keys(SORT_MAP_Y);    

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Sorting</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
                <Menu
                    title="Sort X-Axis"
                    onChange={(e) => {
                        onChange({ sort_x: SORT_MAP_X[e.target.value]});
                    }}
                    entries={
                        SORT_KEYS_X.map((name, index) => {
                            return { key: index, value: name}
                        })
                    }
                />
                <Menu
                    title="Sort Y-Axis"
                    onChange={(e) => {
                        onChange({ sort_y: SORT_KEYS_Y[e.target.value] });
                    }}
                    entries={
                        SORT_KEYS_Y.map((name, index) => {
                            return { key: index, value: name }
                        })
                    }
                />
            </AccordionDetails>
        </Accordion>
    )
}

const MethodFilter = ({ addFilter }) => {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Method Filters</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">

            </AccordionDetails>
        </Accordion>
    )
}

const TestFilter = ({ addFilter }) => {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Test Filters</span>
            </AccordionSummary>
        </Accordion>
    )
}