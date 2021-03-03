import React, {useEffect, useState, useContext } from 'react';
import { fetchProjects, fetchCommits } from '../../logic/api/morpheusAPIv2';

import styles from './Toolbar.module.scss';

// Accordion
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
// import Button from '@material-ui/core/Button';

import { MorpheusContext } from '../../pages/MorpheusContext';


const ToolBar = (props) => {
    return (
        <div className={styles.toolbar}>
            <h4>Toolbar</h4>
            { props.children }
            {/* <Button onClick={props.onUndo}>Undo</Button>
            <Button onClick={props.onRedo}>Redo</Button> 
            <Button onClick={props.onReset}>Reset</Button> */}
        </div>
    )
}

export const CoverageToolbar = ({onChange}) => {
    const {state, dispatch} = useContext(MorpheusContext);

    return (
        <ToolBar>
            <ProjectSelectors
                onChange={dispatch}
                project={state.info.project}
                commit={state.info.commit}
                />
            <CoverageSorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <MethodFilter
                methods={state.coverage.x}
                onChange={dispatch}
                isLoading={state.isLoading}
                valueX={state.sort.x.name}
                valueY={state.sort.y.name}
                />
            <TestFilter
                tests={state.coverage.y}
                onChange={dispatch}
                isLoading={state.isLoading}
            />
        </ToolBar>
    )
}

const ProjectSelectors = ({ onChange, project, commit}) => {

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

        onChange({ type: 'SET_PROJECT', project: project });

        fetchCommits(project.key)
            .then(setCommitList)
            .catch((err) => {
                console.error(err);
                setCommitList([])
            })
    }

    const commitSelect = ({ target }) => {
        const commitSha = target.innerHTML;

        const commit = commitList.find((c) => c.value === commitSha);

        onChange({ type: 'SET_COMMIT', commit: commit });
    }

    return (
        <Accordion >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Project selector</span>
            </AccordionSummary>

            <AccordionDetails className="accordion-block">
                <Autocomplete
                    className={styles.mediumButton}
                    value={project}
                    disableClearable={true}
                    options={projectList}
                    getOptionLabel={(option) => option.value === undefined ? '' : option.value.toString()}
                    onChange={projectSelect}
                    renderInput={(params) => <TextField {...params} label="Projects..." variant="outlined" />}
                />
                <Autocomplete
                    className={styles.mediumButton}
                    value={commit}
                    disableClearable={true}
                    disabled={commitList.length === 0}
                    options={commitList}
                    getOptionLabel={(option) => option.value === undefined ? '' : option.value.toString()}
                    onChange={commitSelect}
                    renderInput={(params) => <TextField {...params} label="Commits..." variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const CoverageSorter = ({ onChange, isLoading, valueX, valueY }) => {

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
                <h4>Sort X-Axis</h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={valueX !== undefined ? valueX : 'NAME'}
                    onChange={(e) => {
                        onChange({ type: 'SET_SORT', x: { name: e.target.value, func: SORT_MAP_X[e.target.value]}});
                    }}
                    disabled={isLoading}
                >
                {SORT_KEYS_X.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                </Select>
                <h4>Sort Y-Axis</h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={valueY !== undefined ? valueY : 'NAME'}
                    onChange={(e) => {
                        onChange({ type: 'SET_SORT', x: { name: e.target.value, func:SORT_MAP_Y[e.target.value] }});
                    }}
                    disabled={isLoading}
                >
                    {SORT_KEYS_Y.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                </Select>
            </AccordionDetails>
        </Accordion>
    )
}

const MethodFilter = ({ onChange, methods }) => {

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Method Filters</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
                <Autocomplete
                    className={styles.bigMenu}
                    id="project-menu"
                    disableClearable={true}
                    disabled={methods.length === 0}
                    options={methods}
                    getOptionLabel={(option) => option.to_string()}
                    onChange={onChange}
                    renderInput={(params) => <TextField {...params} label="Method name" variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const TestFilter = ({ onChange, tests }) => {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Test Filters</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
                <Autocomplete
                    className={styles.bigMenu}
                    id="project-menu"
                    disableClearable={true}
                    disabled={tests.length === 0}
                    options={tests}
                    getOptionLabel={(option) => option.to_string()}
                    onChange={onChange}
                    renderInput={(params) => <TextField {...params} label="Test name" variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}