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

export const CoverageToolbar = ({ updateProject, setSortingMethod, addFilter}) => {
    return (
        <ToolBar>
            <ProjectSelectors updateProject={updateProject} />
            <CoverageSorter setSortingMethod={setSortingMethod} />
            <MethodFilter addFilter={addFilter} />
            <TestFilter addFilter={addFilter} />
        </ToolBar>
    )
}

const ProjectSelectors = ({updateProject}) => {

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

        console.log(project)
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

                        updateProject(project, commit)
                    }}
                    renderInput={(params) => <TextField {...params} label="Commits..." variant="outlined" />}
                />
            </AccordionDetails>
        </Accordion>
    )
}

const CoverageSorter = ({ setSortingMethod }) => {

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span>Sorting</span>
            </AccordionSummary>
            <AccordionDetails className="accordion-block">
                <Menu
                    title="Sort X-Axis"
                    onChange={(e) => {

                        let func = (data) => data
                        switch (e.target.value) {
                            case "Coverage":
                                func = sort_by_coverage_X;
                                break
                            case "Cluster":
                                func = sort_by_cluster_X;
                                break;
                            case "Suspiciousness":
                                func = sort_by_suspciousness;
                                break;
                            default:
                                break;
                        }

                        setSortingMethod("X", func);

                    }}
                    entries={[
                        { key: 0, value: "Name" },
                        { key: 1, value: "Coverage" },
                        { key: 2, value: "Cluster" },
                        { key: 3, value: "Suspiciousness" }
                    ]}
            />
                <Menu
                    title="Sort Y-Axis"
                    onChange={(e) => {
                        let func = (data) => data
                        switch (e.target.value) {
                            case "Coverage":
                                func = sort_by_coverage_Y;
                                break
                            case "Cluster":
                                func = sort_by_cluster_Y;
                                break;
                            default:
                                break;
                        }
                        setSortingMethod("Y", func);
                    }}
                    entries={[
                        { key: 0, value: "Name" },
                        { key: 1, value: "Coverage" },
                        { key: 2, value: "Cluster" },
                    ]}
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