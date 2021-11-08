import React, {useEffect, useState, useContext } from 'react';
import { fetchProjects, fetchCommits } from '../../logic/api/morpheusAPIv2';
import { Project, Commit } from '../../logic/api/MorpheusTypes';
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
import { HISTORY_ACTION } from '../../hooks/useHistoryReducer';
import { MorpheusContext } from '../../pages/MorpheusContext';

// Filters
import { filterByTestType, filterByCoOccurence, filterByTestResult, TEST_TYPES } from '../../logic/filters/methods';
import { sortMethodsByCoverage, sortMethodsByName, sortMethodsBySuspiciousness } from '../../logic/sorting/methods';
import { sortTestsByCoverage, sortTestsByName } from '../../logic/sorting/tests';



const ToolBar = ({ onReset, onUndo, onRedo, children}) => {
    return (
        <div className={styles.toolbar}>
            <h4>Toolbar</h4>
            { children }
            <Button onClick={onReset}>Reset</Button>
            <Button onClick={onUndo}>Undo</Button>
            <Button onClick={onRedo}>Redo</Button>
        </div>
    )
}

export const CoverageToolbar = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    return (
        <ToolBar
            onReset={() => dispatch({ type: HISTORY_ACTION.RESET })}
            onUndo={() => dispatch({ type: HISTORY_ACTION.UNDO })}
            onRedo={() => dispatch({ type: HISTORY_ACTION.REDO })}>
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
            <CoverageInfoBox
                project={state.info.project}
                commit={state.info.commit}
            />
        </ToolBar>
    )
}

export const MethodHistoryToolbar = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    return (
        <ToolBar
            onReset={() => dispatch({ type: HISTORY_ACTION.RESET })}
            onUndo={() => dispatch({ type: HISTORY_ACTION.UNDO })}
            onRedo={() => dispatch({ type: HISTORY_ACTION.REDO })}>
            <ProjectSelectors
                onChange={dispatch}
                project={state.info.project}
                commit={state.info.commit}
            />
            <MethodHistorySorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <MethodInfoBox
                project={state.info.project}
                method={state.info.method}
            />
        </ToolBar>
    )
}

export const TestHistoryToolbar = () => {
    const { state, dispatch } = useContext(MorpheusContext);

    return (
        <ToolBar
            onReset={() => dispatch({ type: HISTORY_ACTION.RESET })}
            onUndo={() => dispatch({ type: HISTORY_ACTION.UNDO })}
            onRedo={() => dispatch({ type: HISTORY_ACTION.REDO })}>
            <ProjectSelectors
                onChange={dispatch}
                project={state.info.project}
                commit={state.info.commit}
            />
            <TestHistorySorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <TestInfoBox
                project={state.info.project}
                test={state.info.test}
            />
        </ToolBar>
    )
}


const ProjectSelectors = ({ onChange, project, commit}) => {

    let [projectList, setProjectList] = useState([])
    let [commitList, setCommitList] = useState([])

    useEffect(() => {
        fetchProjects()
            .then((projects) => projects.map(p => new Project(p.project_name, p.id)))
            .then(setProjectList)
            .catch(console.error)
    }, [])

    const projectSelect = ({ target }) => {
        const projectName = target.innerHTML;

        const project = projectList.find((p) => p.getProjectName() === projectName);

        onChange({ type: MORPHEUS_ACTION.SET_PROJECT, project: project });

        fetchCommits(project.getID())
            .then((commits) => {
                return commits.map(c => new Commit(
                    c.id,
                    c.sha,
                    c.datetime,
                    c.author
                )).sort((a, b) => a.getDate() - b.getDate())
                
            })
            .then(setCommitList)
            .catch((err) => {
                console.error(err);
                setCommitList([])
            })
    }

    const commitSelect = ({ target }) => {
        const commitSha = target.innerHTML;

        const commit = commitList.find((c) => c.toString() === commitSha);

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
                    getOptionLabel={(option) => option === undefined ? '' : option.toString()}
                    onChange={projectSelect}
                    renderInput={(params) => <TextField {...params} label="Projects..." variant="outlined" />}
                />
                <Autocomplete
                    className={styles.mediumButton}
                    value={commit}
                    disableClearable={true}
                    disabled={commitList.length === 0}
                    options={commitList}
                    getOptionLabel={(option) => option === undefined ? '' : option.toString()}
                    onChange={commitSelect}
                    renderInput={(params) => <TextField {...params} label="Commits..." variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const CoverageSorter = ({ onChange, isLoading, valueX, valueY }) => {

    const SORT_MAP_X = {
        // Id: (a, b) => a.getID() > b.getID(),
        Name: sortMethodsByName,
        Coverage: sortMethodsByCoverage,
        Suspiciousness: sortMethodsBySuspiciousness
    };

    const SORT_KEYS_X = Object.keys(SORT_MAP_X);

    const SORT_MAP_Y = {
        Name: sortTestsByName,
        Coverage: sortTestsByCoverage,
    };

    const SORT_KEYS_Y = Object.keys(SORT_MAP_Y);    

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Sorting</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
            <div className="block">
                <h4>Sort Methods</h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={valueX !== undefined ? valueX : 'Name'}
                    onChange={(e) => {
                        onChange({ type: MORPHEUS_ACTION.SET_SORT, x: { name: e.target.value, func: SORT_MAP_X[e.target.value]}});
                    }}
                    disabled={isLoading}
                >
                {SORT_KEYS_X.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                </Select>
                </div>
                <div>
                <h4>Sort Tests</h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={valueY !== undefined ? valueY : 'Name'}
                    onChange={(e) => {
                        onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func:SORT_MAP_Y[e.target.value] }});
                    }}
                    disabled={isLoading}
                >
                    {SORT_KEYS_Y.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                </Select>
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

const MethodHistorySorter = ({ onChange, isLoading, valueX, valueY }) => {
    const SORT_MAP_TESTS = {
        Name: sortTestsByName,
    };

    const SORT_KEYS_TESTS = Object.keys(SORT_MAP_TESTS);

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Sorting</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
                <h4>Sort Tests</h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={valueY !== undefined ? valueY : 'Name'}
                    onChange={(e) => {
                        onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func: SORT_MAP_TESTS[e.target.value] } });
                    }}
                    disabled={isLoading}
                >
                    {SORT_KEYS_TESTS.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                </Select>
            </AccordionDetails>
        </Accordion>
    )
}

const TestHistorySorter = ({ onChange, isLoading, valueX, valueY }) => {
    const SORT_MAP_METHODS = {
        Name: sortMethodsByName,
    };

    const SORT_KEYS_METHODS = Object.keys(SORT_MAP_METHODS);

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Sorting</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
                <h4>Sort Methods</h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={valueY !== undefined ? valueY : 'Name'}
                    onChange={(e) => {
                        onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func: SORT_MAP_METHODS[e.target.value] } });
                    }}
                    disabled={isLoading}
                >
                    {SORT_KEYS_METHODS.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
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
                    getOptionLabel={(option) => option.toString()}
                    onChange={setFilter}
                    renderInput={(params) => <TextField {...params} label="Method name" variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const TestFilter = ({ onChange, tests, isLoading }) => {
    const TEST_RESULTS = {
        All: "All",
        Passed: true,
        Failed: false,
    }

    const TEST_RESULT_KEYS = Object.keys(TEST_RESULTS);
    const TEST_TYPES_KEYS = Object.keys(TEST_TYPES);

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
                    getOptionLabel={(option) => option.toString()}
                    onChange={onChange}
                    renderInput={(params) => <TextField {...params} label="Test name" variant="outlined" />}
                />
                <h4>Test Result: </h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={TEST_RESULTS.All.toString()}
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
                <h4>Test Type: </h4>
                <Select
                    className={styles.mediumMenu}
                    defaultValue={TEST_TYPES.ALL.toString()}
                    onChange={(e) => {
                        onChange({
                            type: MORPHEUS_ACTION.ADD_FILTER,
                            filters: {
                                TEST_TYPE: filterByTestType(e.target.value)
                            }
                        })
                    }}
                    disabled={isLoading}
                >
                    {TEST_TYPES_KEYS.map((name, index) => <MenuItem key={name} value={TEST_TYPES[name]}>{name}</MenuItem>)}
                </Select>
            </AccordionDetails>
        </Accordion>
    )
}

const InfoBox = ({project, children}) => {
    if (project === null) {
        return null;
    }

    return (
        <div>
            <h3>Project: {project.toString()}</h3>
            {children}
        </div>
    )
}

const CoverageInfoBox = ({project, commit}) => {
    if (commit === undefined) {
        return null;
    }

    return (
        <InfoBox project={project}>
            <p>SHA: {commit.getSHA()}</p>
            <p>Author: {commit.getAuthor()}</p>
            <p>Date: {commit.getDate().toISOString()}</p>
        </InfoBox>
    )
}

const MethodInfoBox = ({ project, method }) => {
    if (method === undefined) {
        return null;
    }

    return (
        <InfoBox project={project}>
            <p><b>Method Decl:{method.getMethodName()}</b></p>
            <p>Package: {method.getPackageName()}</p>
            <p>Class: {method.getClassName()}</p>
        </InfoBox>
    )
}

const TestInfoBox = ({ project, test }) => {
    if (test === undefined) {
        return null;
    }

    return (
        <InfoBox project={project}>
            <p><b>Testcase: {test.getMethodName()}</b></p>
            <p>Package: {test.getPackageName()}</p>
            <p>Class: {test.getClassName()}</p>
        </InfoBox>
    )
}