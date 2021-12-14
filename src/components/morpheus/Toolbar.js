import React, {useEffect, useState, useContext } from 'react';
import { fetchProjects, fetchCommits } from '../../logic/api/morpheusAPIv2';
import { Project, Commit } from '../../logic/api/MorpheusTypes';
import styles from './Toolbar.module.scss';


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
import { filterByCoexecutedTests } from '../../logic/filters/tests';
import { sortMethodsByCoverage, sortMethodsByName, sortMethodsBySuspiciousness } from '../../logic/sorting/methods';
import { sortTestsByCoverage, sortTestsByName } from '../../logic/sorting/tests';
import { COLOR_SCHEMES } from '../../logic/coloring/useColors';


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
                commit={state.info.commit} />
            <hr/>
            <CoverageSorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <hr/>
            <h4 style = {{ margin: '5px' }}>Filters</h4>
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
            <hr/>
            <CoverageColorSelector
                onChange={dispatch}
                isLoading={state.isLoading}/>
            <hr/>
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
            <hr/>
            <MethodHistorySorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <hr/>
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
            <hr/>
            <TestHistorySorter
                isLoading={state.isLoading}
                onChange={dispatch} />
            <hr/>
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
    <div style= {{ display: 'flex' }}>
            <Autocomplete
                className={styles.mediumButton}
                value={project}
                disableClearable={true}
                options={projectList}
                getOptionLabel={(option) => option === undefined ? '' : option.toString()}
                onChange={projectSelect}
                renderInput={(params) => <TextField {...params} label="Projects..." variant="outlined" />}
                style= {{ flex: '1', margin: '2px' }}
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
                style= {{ flex: '1', margin: '2px' }}
            />
    </div>
    )
}

const CoverageSorter = ({ onChange, isLoading, valueX, valueY }) => {

    const SORT_MAP_X = {
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
        <div style = {{ margin: '5px' }}>
            <h4>Sorting</h4>
            <div style= {{ display: 'flex' }}>
                <div style = {{ flex: '1', margin: '2px' }} >
                    <h6>Sort Methods</h6>
                    <Select
                        className={styles.mediumMenu}
                        defaultValue={valueX !== undefined ? valueX : 'Name'}
                        onChange={(e) => {
                            onChange({ type: MORPHEUS_ACTION.SET_SORT, x: { name: e.target.value, func: SORT_MAP_X[e.target.value]}});
                        }}
                        disabled={isLoading}>
                    {SORT_KEYS_X.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                    </Select>
                </div>
                <div style = {{ flex: '1', margin: '2px' }}>
                    <h6>Sort Tests</h6>
                    <Select
                        className={styles.mediumMenu}
                        defaultValue={valueY !== undefined ? valueY : 'Name'}
                        onChange={(e) => {
                            onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func:SORT_MAP_Y[e.target.value] }});
                        }}
                        disabled={isLoading}>
                        {SORT_KEYS_Y.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                    </Select>
                </div>
            </div>
        </div>
    )
}

const MethodHistorySorter = ({ onChange, isLoading, valueX, valueY }) => {
    const SORT_MAP_TESTS = {
        Name: sortTestsByName,
    };

    const SORT_KEYS_TESTS = Object.keys(SORT_MAP_TESTS);

    return (

        <div style = {{ margin: '5px' }}>
            <h4>Sort Tests</h4>
            <Select
                className={styles.mediumMenu}
                defaultValue={valueY !== undefined ? valueY : 'Name'}
                onChange={(e) => {
                    onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func: SORT_MAP_TESTS[e.target.value] } });
                }}
                disabled={isLoading}>
                {SORT_KEYS_TESTS.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
            </Select>
        </div>
    )
}

const TestHistorySorter = ({ onChange, isLoading, valueX, valueY }) => {
    const SORT_MAP_METHODS = {
        Name: sortMethodsByName,
    };

    const SORT_KEYS_METHODS = Object.keys(SORT_MAP_METHODS);

    return (

        <div style = {{ margin: '5px' }}>
            <h4>Sort Methods</h4>
            <Select
                className={styles.mediumMenu}
                defaultValue={valueY !== undefined ? valueY : 'Name'}
                onChange={(e) => {
                    onChange({ type: MORPHEUS_ACTION.SET_SORT, y: { name: e.target.value, func: SORT_MAP_METHODS[e.target.value] } });
                }}
                disabled={isLoading}>
                    {SORT_KEYS_METHODS.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
                </Select>
        </div>
    )
}


export const CoverageColorSelector = ({ onChange, isLoading }) => {
    const COLOR_SCHEMES_KEYS = Object.values(COLOR_SCHEMES);

    return (
        <div style = {{ margin: '5px' }}>
            <h4>Select Color Scheme</h4>
            <Select
                className={styles.mediumMenu}
                defaultValue={COLOR_SCHEMES.TEST_RESULT}
                onChange={(e) => {
                    let color_scheme = e.target.value;
                    onChange({
                        type: MORPHEUS_ACTION.SET_COLOR_SCHEME,
                        color_scheme: color_scheme
                    })
                }}
                disabled={isLoading}>
            {COLOR_SCHEMES_KEYS.map((name, index) => <MenuItem key={index} value={name}>{name}</MenuItem>)}
            </Select>
        </div>
    )
}

const MethodFilter = ({ onChange, methods }) => {

    const setFilter = ({ target }) => {
        const method_name = target.innerHTML;

        let method = methods.find(method => method.toString() === method_name);

        if (method === undefined) {
            console.warn("Method not found in methods", methods, method_name)
            return;
        }

        onChange({
            type: MORPHEUS_ACTION.ADD_FILTER,
            filters: {
                METHOD_FILTER: filterByCoOccurence(method)
            }
        })
    }

    return (
        <Autocomplete
            className={styles.bigMenu}
            id="project-menu"
            disableClearable={true}
            disabled={methods.length === 0}
            options={methods}
            getOptionLabel={(option) => option.toString()}
            onChange={setFilter}
            renderInput={(params) => <TextField {...params} label="Filter: Method name" variant="outlined" />}
            style = {{ margin: '5px' }}
        />
    )
}

const TestFilter = ({ onChange, tests, isLoading }) => {
    const TEST_RESULTS = {
        All: "All",
        Passed: "Passed",
        Failed: "Failed",
    }

    const TEST_RESULT_VALUES = Object.values(TEST_RESULTS);
    const TEST_TYPES_VALUES = Object.values(TEST_TYPES);

    const setFilter = ({ target }) => {
        const test_name = target.innerHTML;

        let test = tests.find(test => test.toString() === test_name);

        if (test === undefined) {
            console.warn("Test not found in tests", tests, test_name)
            return;
        }

        onChange({
            type: MORPHEUS_ACTION.ADD_FILTER,
            filters: {
                TEST_FILTER: filterByCoexecutedTests(test)
            }
        })
    }

    return (
        <div>
            <Autocomplete
                className={styles.bigMenu}
                id="project-menu"
                disableClearable={true}
                disabled={tests.length === 0}
                options={tests}
                getOptionLabel={(option) => option.toString()}
                onChange={setFilter}
                renderInput={(params) => <TextField {...params} label="Filter: Test name" variant="outlined" />}
                style = {{ margin: '5px' }}
            />
            <div style = {{ display: 'flex', margin: '5px' }}>
                <div style = {{ flex: '1', padding: '2px' }} >
                    <h6>Test Result: </h6>
                    <Select
                        className={styles.mediumMenu}
                        defaultValue={TEST_RESULTS.All}
                        onChange={(e) => {
                            const select = e.target.value;
                            let test_result = undefined;
                            // Assume no filter else it is passed or failed.
                            if (select === TEST_RESULTS.Passed || select === TEST_RESULTS.Failed) {
                                test_result = (select === TEST_RESULTS.Passed);
                            }

                            onChange({
                                type: MORPHEUS_ACTION.ADD_FILTER,
                                filters: {
                                    TEST_RESULT: filterByTestResult(test_result)
                                }
                            })
                        }}
                        disabled={isLoading}>
                        {TEST_RESULT_VALUES.map((name, index) => <MenuItem key={index} value={name.toString()}>{name.toString()}</MenuItem>)}
                    </Select>
                </div>
                <div style = {{ flex: '1', padding: '2px' }} >
                    <h6>Test Type: </h6>
                    <Select
                        className={styles.mediumMenu}
                        defaultValue={TEST_TYPES.ALL}
                        onChange={(e) => {
                            onChange({
                                type: MORPHEUS_ACTION.ADD_FILTER,
                                filters: {
                                    TEST_TYPE: filterByTestType(e.target.value)
                                }
                            })
                        }}
                        disabled={isLoading}>
                        {TEST_TYPES_VALUES.map((name, index) => <MenuItem key={index} value={name.toString()}>{name}</MenuItem>)}
                    </Select>
                </div>
            </div>
        </div>
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