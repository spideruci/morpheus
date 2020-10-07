import React, { Component } from 'react'
import { json } from 'd3'
import TestMatrixView from '../visualizations/TestMatrixView';
import './TestMatrixVisualization.scss';
import { API_ROOT } from '../../config/api-config';

class TestMatrixVisualization extends Component {
    constructor(props) {
        super(props);

        this.testMatrixRef = React.createRef();

        this.state = {
            selectedProject: "",
            selectedCommit: "",
            prod_methods: [],
            test_methods: [],
            links: [],
            projects: [],
            commits: [],
        }

        this.data = {
            prod_methods: [],
            test_methods: [],
            links: [],
        }
    }

    async onCommitChange(event) {
        let commit_sha = event.target.value;

        let data = await this.updateCoverageData(this.state.selectedProject, commit_sha);

        this.setState({
            selectedCommit: commit_sha,
            prod_methods: data.prod_methods,
            test_methods: data.test_methods,
            links: data.links,
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
                    return { value: commit.commit_sha, display: commit.commit_sha }
                });
                if (commits.length === 1) {
                    commits.push(commits[0])
                }
                return commits;
            })
    }

    async updateProjectData() {
        return await json(`${API_ROOT}/projects/`)
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
                    prod_methods: response.coverage.methods,
                    test_methods: response.coverage.tests,
                    links: response.coverage.links,
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
            prod_methods: data.prod_methods,
            test_methods: data.test_methods,
            links: data.links,
        })
    }

    render() {
        console.log("Render")
        return (
            <div class='test-visualization'>
                <div id='visualization'>
                    <TestMatrixView ref={this.testMatrixRef} prod_methods={this.state.prod_methods} test_methods={this.state.test_methods} links={this.state.links} />
                </div>

                <div id='toolbox'>
                    <h4>Toolbar</h4>
                    <div> 
                        <span>Project: </span>
                        <select onChange={this.onProjectChange.bind(this)}>
                            {this.state.projects.map((project) => <option key={project.value} value={project.value}>{project.display}</option>)}
                        </select>
                    </div>
                    <div>
                        <span>Commit: </span>
                        <select onChange={this.onCommitChange.bind(this)}>
                            {this.state.commits.map((commit) => <option key={commit.value} value={commit.value}>{commit.display}</option>)}
                        </select>
                    </div>
                    <div>
                        <span>Tested: </span>
                    </div>
                    <div>
                        <span>Search Method: </span>
                    </div>
                    <div>
                        <span>Search Test: </span>
                    </div>
                    <div>
                        <span>Back Button: </span>
                    </div>
                    <div>
                        <span>Forward Button (only available after back?): </span>
                    </div>
                    <div>
                        <span>Reset Button: </span>
                    </div>
                </div>
            </div>
        )
    }
}

export default TestMatrixVisualization