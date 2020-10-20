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
import List from '../common/List';
import Menu from '../common/Menu';
import ResultTextBox from '../common/ResultTextBox';

class TestMatrixView extends Component {
    constructor(props) {
        super();

        this.state = {
            selectedProject: "",
            selectedCommit: "",
            history: [{
                x: [],
                y: [],
                edges: [],
            }],
            projects: [],
            commits: [],
        }

        this.backInTime = this.backInTime.bind(this);
        this.onProjectChange = this.onProjectChange.bind(this);
        this.onCommitChange = this.onCommitChange.bind(this)
        this.onMethodClick = this.onMethodClick.bind(this);
        this.onTestClick = this.onTestClick.bind(this);
    }

    async onCommitChange(event) {
        let commit_sha = event.target.value;

        let data = await this.updateCoverageData(this.state.selectedProject, commit_sha);

        this.setState({
            selectedCommit: commit_sha,
            history: [{
                x: data.methods,
                y: data.tests,
                edges: data.edges,
            }]
        })
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
            history: [{
                x: data.methods,
                y: data.tests,
                edges: data.edges,
            }]
        })
    }

    backInTime() {
        // Only allow to previous state if there is a previous state.
        if (this.state.history.length <= 1) {
            return;
        }

        const new_history = this.state.history.slice(0, this.state.history.length - 1);
        this.setState({
            history: new_history,
        })
    }

    onMethodClick(e, label) {
        const history = this.state.history;
        const current = history[this.state.history.length - 1]

        let methods = current.x;
        let test_cases = current.y;
        let edges = current.edges;

        const method_id = parseInt(e.target.value);
        
        const filter_method = methods.find(m => m.get_id() === method_id);

        const test_ids = edges.filter(edge => filter_method.method_id === edge.method_id)
            .map(edge => edge.test_id);

        const filtered_tests = test_cases.filter(test => test_ids.includes(test.test_id))

        const filtered_edges = edges.filter(
            edge => test_ids.includes(edge.test_id) || edge.method_id === filter_method.method_id)

        const method_ids = filtered_edges.map(edge => edge.method_id)

        const filtered_methods = methods.filter(method => method_ids.includes(method.method_id));

        this.setState({
            history: this.state.history.concat({
                x: filtered_methods,
                y: filtered_tests,
                edges: filtered_edges
            }),
        })
    }

    testPassFilter(event) {
        const index = parseInt(event.target.value);
        const current_state = this.state.history[this.state.history.length - 1]

        function test_filter(current_state, predicate) {
            const methods = current_state.x;
            const tests = current_state.y;
            const edges = current_state.edges;

            const new_edges = edges.filter(predicate)
            const method_ids = new_edges.map(edge => edge.method_id)
            const test_ids = new_edges.map(edge => edge.test_id)

            const new_methods = methods.filter((method) => method_ids.includes(method.method_id))
            const new_tests = tests.filter((test) => test_ids.includes(test.test_id))
            return {
                x: new_methods,
                y: new_tests,
                edges: new_edges,
            }
        }

        let new_state;
        switch (index) {
            case 1: // Present only passing methods
                console.info(`Filter all test methods that fail Index: ${index}, was chosen.`);
                new_state = test_filter(current_state, (edge) => edge.test_result)
                break;
            case 2: // Present only failing methods
                console.info(`Filter all test methods that pass Index: ${index}, was chosen.`);
                new_state = test_filter(current_state, (edge) => !edge.test_result)
                break;
            default:
                console.info(`No methods have been filtered. Index: ${index}, was chosen.`);
                return;
        }

        this.setState({
            history: this.state.history.concat(new_state)
        })
    }

    onTestClick(event) {
        const history = this.state.history;
        const current = history[this.state.history.length - 1]

        let methods = current.x;
        let test_cases = current.y;
        let edges = current.edges;

        const test_id = parseInt(event.target.value);

        const filter_test = test_cases.find(test => test.get_id() === test_id);

        const method_ids = edges.filter(edge => filter_test.test_id === edge.test_id)
            .map(edge => edge.method_id);

        const filtered_methods = methods.filter(m => method_ids.includes(m.method_id))

        const filtered_edges = edges.filter(
            edge => method_ids.includes(edge.method_id) || edge.test_id === filter_test.test_id)

        const test_ids = filtered_edges.map(edge => edge.test_id)

        const filtered_tests = test_cases.filter(test => test_ids.includes(test.test_id));

        this.setState({
            history: this.state.history.concat({
                x: filtered_methods,
                y: filtered_tests,
                edges: filtered_edges
            }),
        })
    }

    render() {
        const states = this.state.history.length
        const current_state = this.state.history[states - 1];

        const labelToggle = states > 1 ? true : false;
        return (
            <div className='test-visualization'>
                <div id='visualization'>
                    <MatrixVisualization x={current_state.x} y={current_state.y} edges={current_state.edges} onMethodClick={this.onMethodClick} onTestClick={this.onTestClick} labelToggle={labelToggle}/>
                </div>

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
                            <Menu title="Test Pass Filter" entries={[{ key: 0, value: "All" }, { key: 1, value: "Only Pass" }, { key: 2, value: "Only Fail" }]} onChange={this.testPassFilter.bind(this)} />
                            <FilterMenu title="Search Test:" entries={current_state.y} onClick={(event) => this.onTestClick(event, event.target.text)} />
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
                        </AccordionDetails>
                    </Accordion>

                    <ResultTextBox title="Methods" entries={current_state.x}/>
                    <ResultTextBox title="Tests" entries={current_state.y}/>

                    <span>Back Button: </span><button onClick={this.backInTime}>BACK</button>
                </div>
            </div>
        )
    }
}

export default TestMatrixView;