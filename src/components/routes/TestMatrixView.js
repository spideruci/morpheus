import React, { Component } from 'react'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { json } from 'd3'
import MatrixVisualization from '../visualizations/MatrixVisualization';
import './TestMatrixView.scss';
import { API_ROOT } from '../../config/api-config';
import FilterMenu from '../common/FilterMenu';
import FilterSlider from '../common/FilterSlider';
import List from '../common/List';
import Menu from '../common/Menu';
import ResultTextBox from '../common/ResultTextBox';

import { testMethodCountFilter, testPassFilter } from '../filters/test_filters';
import { methodTestFilter } from '../filters/method_filters';
import { process_data, FunctionMap } from '../filters/data_processor';

class TestMatrixView extends Component {
    constructor(props) {
        super();

        this.state = {
            selectedProject: "",
            selectedCommit: "",
            data: {
                x: [],
                y: [],
                edges: [],
            },
            history: [new FunctionMap()],
            projects: [],
            commits: [],
        }

        this.backInTime = this.backInTime.bind(this);
        this.reset = this.reset.bind(this);
        this.onProjectChange = this.onProjectChange.bind(this);
        this.onCommitChange = this.onCommitChange.bind(this)
        // this.onMethodClick = this.onMethodClick.bind(this);
        // this.onTestClick = this.onTestClick.bind(this);
        this.testMethodCountFilter = testMethodCountFilter.bind(this);
        this.testPassFilter = testPassFilter.bind(this);
        this.methodTestFilter = methodTestFilter.bind(this);
    }

    async onCommitChange(event) {
        let commit_sha = event.target.value;

        this.updateCoverageData(this.state.selectedProject, commit_sha)
            .then((data) => {
                this.setState({
                    selectedCommit: commit_sha,
                    data: {
                        x: data.methods,
                        y: data.tests,
                        edges: data.edges,
                    },
                    history: [new FunctionMap()]
                })
            })
            .catch(e => console.error(e));
    }

    async onProjectChange(event) {
        let project_name = event.target.value;

        this.setState({
            selectedProject: project_name,
            commits: await this.updateCommitData(project_name)
        })
    }

    async updateCommitData(project_name) {
        return await json(`${API_ROOT}/commits/${project_name}`)
            .then(response => {
                let commits = response.commits.map(commit => {
                    return { value: commit.sha, display: commit.sha }
                });
                return commits;
            })
    }

    async updateProjectData() {
        return await json(`${API_ROOT}/projects`)
            .then(response => {
                let projects = response.projects.map(project => {
                    return { value: project.project_name, display: project.project_name }
                });

                return projects;
            })
    }

    async updateCoverageData(project_name, commit_sha) {
        console.debug(`${API_ROOT}/coverage/${project_name}/${commit_sha}`);
        return await json(`${API_ROOT}/coverage/${project_name}/${commit_sha}`)
            .then((response) => {
                return {
                    methods: response.coverage.methods.map(m => {
                        m.get_id = () => m.method_id;
                        m.to_string = () => `${m.package_name}.${m.class_name}.${m.method_decl}`;
                        return m;}),
                    tests: response.coverage.tests.map(t => {
                        t.get_id = () => t.test_id;
                        t.to_string = () => `${t.class_name}.${t.method_name}`;
                        return t;
                    }),
                    edges: response.coverage.edges,
                }
            })
            .catch((e) => {
                console.log(e);
            });
    }

    async componentDidMount() {
        let projects = await this.updateProjectData();
        let project_name = projects[0].value;

        let commits = await this.updateCommitData(project_name);
        let commit_sha = commits[0].value;
        let data = await this.updateCoverageData(project_name, commit_sha);

        this.setState({
            selectedProject: projects[0].value,
            selectedCommit: commits[0].value,
            projects: projects,
            commits: commits,
            data: {
                x: data.methods,
                y: data.tests,
                edges: data.edges,
            },
            history: [new FunctionMap()]
        })
    }

    backInTime() {
        // Only allow to previous state if there is a previous state.
        if (this.state.history.length <= 1) {
            return;
        }

        const new_history = this.state.history.slice(0, this.state.history.length - 1);
        this.setState({
            history: new_history
        })
    }

    reset() {
        this.setState({
            history: [new FunctionMap()]
        })
    }

    render() {
        const history = this.state.history
        const current_filter_map = history[history.length - 1]

        const current_state = process_data(this.state.data, current_filter_map)
        const labelToggle = history.length > 1 ? true : false;
        // {/* <MatrixVisualization x={current_state.x} y={current_state.y} edges={current_state.edges} onMethodClick={this.onMethodClick} onTestClick={this.onTestClick} labelToggle={labelToggle}/> */}
        return (
            <div className='test-visualization'>
                {((current_state.x.length >= 0) || (current_state.y.length >= 0)) &&
                    <MatrixVisualization x={current_state.x} y={current_state.y} edges={current_state.edges} labelToggle={labelToggle}/>
                }

                <div id='toolbox'>
                    <h4>Toolbar</h4>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector"
                        >
                        <span>Project selector</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                            <List title="Projects" onProjectChange={this.onProjectChange} entries={this.state.projects} />
                            <List title="Commit" onProjectChange={this.onCommitChange} entries={this.state.commits} />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector"
                        >
                            <span>Test Filters</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                            <Menu title="Test Pass Filter" entries={[{ key: 0, value: "All" }, { key: 1, value: "Only Pass" }, { key: 2, value: "Only Fail" }]} onChange={(event) => {
                                const index = parseInt(event.target.value);
                                let new_filter_map = new FunctionMap(current_filter_map);
                                new_filter_map.add_function("test_pass_filter", this.testPassFilter, index)
                                
                                this.setState({
                                    history: this.state.history.concat(new_filter_map)
                                })
                            }} />
                            <FilterMenu title="Search Test:" entries={current_state.y} onClick={(event) => this.onTestClick(event, event.target.text)} />
                            <FilterSlider title="Method Count"
                                defaultValue={0}
                                min={0}
                                max={25}
                                onChange={(_, value) => {
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("test_count_filter", this.testMethodCountFilter, value)

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector"
                        >
                            <span>Method Filters</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                            <FilterMenu title="Search Method:" entries={current_state.x} onClick={(event) => this.onMethodClick(event, event.target.text)} />
                            <FilterSlider 
                                title="Test Count"
                                defaultValue={0}
                                min={0}
                                max={25}
                                onChange={(_, value) => {
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("test_count_filter", this.testMethodCountFilter, value)

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} />
                        </AccordionDetails>
                    </Accordion>

                    <ResultTextBox title="Methods" entries={current_state.x}/>
                    <ResultTextBox title="Tests" entries={current_state.y}/>

                    <div id="control-tools">
                        <button onClick={this.backInTime}>Back</button>
                        <button onClick={this.reset}>Reset</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default TestMatrixView;