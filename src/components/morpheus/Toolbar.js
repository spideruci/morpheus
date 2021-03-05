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
import Button from '@material-ui/core/Button';

import { MORPHEUS_ACTION } from '../../hooks/useMorpheusReducer';
import { MorpheusContext } from '../../pages/MorpheusContext';

// Filters
import { filterByCoOccurence, filterByTestResult } from '../../logic/filters/filters';


const ToolBar = ({ onReset, onUndo, children}) => {
    return (
        <div className={styles.toolbar}>
            <h4>Toolbar</h4>
            { children }
            <Button onClick={onReset}>Reset</Button>
        </div>
    )
}

export const CoverageToolbar = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    return (
        <ToolBar
            onReset={() => dispatch({ type: MORPHEUS_ACTION.RESET })}>
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

export const MethodHistoryToolbar = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    return (
        <ToolBar
            dispatch={dispatch}>
            <ProjectSelectors
                onChange={dispatch}
                project={state.info.project}
                commit={state.info.commit}
            />
            <CoverageSorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <TestFilter
                tests={state.coverage.y}
                onChange={dispatch}
                isLoading={state.isLoading}
            />
        </ToolBar>
    )
}

export const TestHistoryToolbar = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    return (
        <ToolBar
            dispatch={dispatch}>
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

        onChange({ type: MORPHEUS_ACTION.SET_PROJECT, project: project });

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

        onChange({ type: MORPHEUS_ACTION.SET_COMMIT, commit: commit });
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
                        onChange({ type: MORPHEUS_ACTION.SET_SORT, x: { name: e.target.value, func: SORT_MAP_X[e.target.value]}});
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
                        onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func:SORT_MAP_Y[e.target.value] }});
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

    const setFilter = ({ target }) => {
        const methodName = target.innerHTML;

        onChange({
            type: MORPHEUS_ACTION.ADD_FILTER,
            filters: {
                METHOD_FILTER: filterByCoOccurence(methodName)
            }
        })
    }

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
                    onChange={setFilter}
                    renderInput={(params) => <TextField {...params} label="Method name" variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const TestFilter = ({ onChange, tests, isLoading }) => {
    const TEST_RESULTS = {
        ALL: ``,
        PASSED: true,
        FAILED: false,
    }

    const TEST_RESULT_KEYS = Object.keys(TEST_RESULTS);

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
                <h4>Test Result: </h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={TEST_RESULTS.ALL.toString()}
                    onChange={(e) => {
                        onChange({
                            type: MORPHEUS_ACTION.ADD_FILTER,
                            filters: {
                                TEST_RESULT: filterByTestResult(e.target.value)
                            }
                        })
                    }}
                    disabled={isLoading}
                >
                    {TEST_RESULT_KEYS.map((name, index) => <MenuItem key={name} value={TEST_RESULTS[name]}>{name}</MenuItem>)}
                </Select>
            </AccordionDetails>
        </Accordion>
    )
}