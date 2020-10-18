import React, { Component } from 'react'
import { json } from 'd3'
import MatrixVisualization from '../visualizations/MatrixVisualization';
import './TestMatrixView.scss';
import { API_ROOT } from '../../config/api-config';
import FilterMenu from '../common/FilterMenu';

class TestMatrixView extends Component {
    constructor(props) {
        super(props);

        this.testMatrixRef = React.createRef();

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
                if (commits.length === 1) {
                    commits.push(commits[0])
                }
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
        console.log(`${API_ROOT}/coverage/${project_name}/${commit_sha}`);
        return await json(`${API_ROOT}/coverage/${project_name}/${commit_sha}`)
            .then((response) => {
                return {
                    methods: response.coverage.methods,
                    tests: response.coverage.tests,
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
            history: this.state.history.concat({
                x: data.methods,
                y: data.tests,
                edges: data.edges,
            })
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

        const filter_method = methods.find(m => label === `${m.package_name}.${m.class_name}.${m.method_decl}`);

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

    onTestClick(e, label) {
        const history = this.state.history;
        const current = history[this.state.history.length - 1]

        let methods = current.x;
        let test_cases = current.y;
        let edges = current.edges;

        const filter_test = test_cases.find(test => label === `${test.class_name}.${test.method_name}`);

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
        console.log("Render")
        const current = this.state.history[this.state.history.length - 1]

        return (
            <div className='test-visualization'>
                <div id='visualization'>
                    <MatrixVisualization ref={this.testMatrixRef} x={current.x} y={current.y} edges={current.edges} onMethodClick={this.onMethodClick} onTestClick={this.onTestClick} labelToggle={false}/>
                </div>

                {/* Refactor the following as a separate Component? */}
                <div id='toolbox'>
                    <h4>Toolbar</h4>
                    <div> 
                        <span>Project: </span>
                        <select onChange={this.onProjectChange}>
                            {this.state.projects.map((project) => <option key={project.value} value={project.value}>{project.display}</option>)}
                        </select>
                    </div>
                    <div>
                        <span>Commit: </span>
                        <select onChange={this.onCommitChange}>
                            {this.state.commits.map((commit) => <option key={commit.value} value={commit.value}>{commit.display}</option>)}
                        </select>
                    </div>
                    {/* <div>
                        <span>Tested: </span>
                    </div> */}
                    <div>
                        <span>Search Method:</span>
                        <FilterMenu entries={current.x}/>
                    </div>
                    <div>
                        <span>Search Test: </span>
                        <FilterMenu entries={current.y} />
                    </div>
                    <div>
                        <span>Back Button: </span><button onClick={this.backInTime}>BACK</button>
                    </div>
                    {/* <div>
                        <span>Reset Button: </span>
                    </div> */}
                </div>
            </div>
        )
    }
}

export default TestMatrixView;