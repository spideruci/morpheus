import React, { Component } from 'react'
import { json } from 'd3'

// API endpoints
import { API_ROOT } from '../../config/api-config';

// Material UI components
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Custom Components
import MatrixVisualization from '../visualizations/MatrixVisualization';
import FilterMenu from '../common/FilterMenu';
import FilterSlider from '../common/FilterSlider';
import Menu from '../common/Menu';
import ResultTextBox from '../common/ResultTextBox';

// Style sheets
import './TestMatrixView.scss';

//  Filter functions
import { filter_by_num_method_covered, filter_by_test_passed, filter_by_coexecuted_tests, filter_by_test_type, TEST_TYPES, TEST_RESULT} from '../filters/test_filters';
import { filter_method_by_number_of_times_tested, filter_by_coexecuted_methods } from '../filters/method_filters';
import { process_data, FunctionMap } from '../filters/data_processor';
import { sort_by_cluster_X, sort_by_cluster_Y, sort_by_coverage_X, sort_by_coverage_Y, sort_by_suspciousness} from '../filters/sorting';

class HistoryMatrixView extends Component {
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
            expanded: false,
            reset: false,
        }

        this.backInTime = this.backInTime.bind(this);
        this.reset = this.reset.bind(this);
        this.onProjectChange = this.onProjectChange.bind(this);
        this.onCommitChange = this.onCommitChange.bind(this);
        this.updateReset = this.updateReset.bind(this);
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
                    return { key: commit.id, value: commit.sha, display: commit.sha }
                });
                return commits;
            })
    }

    async updateProjectData() {
        return await json(`${API_ROOT}/projects`)
            .then(response => {
                let projects = response.projects.map(project => {
                    return { key: project.id, value: project.project_name};
                });

                return projects;
            })
    }

    async updateCoverageData(project_name, commit_sha) {
        console.debug(`${API_ROOT}/coverage/${project_name}/${commit_sha}`);
        return await json(`${API_ROOT}/coverage/${project_name}/${commit_sha}`)
            .then((response) => {
                console.log("Response: ", response);
                return {
                    methods: response.coverage.methods.map(m => {
                        m.get_id = () => m.method_id;
                        m.to_string = () => `${m.package_name}.${m.class_name} ${m.method_decl}`;
                        m.get_cluster = () => m.hasOwnProperty('cluster_id') ? m.cluster_id :  0;
                        m.get_color = () => m.package_name
                        return m;
                    }),
                    tests: response.coverage.tests.map(t => {
                        t.get_id = () => t.test_id;
                        t.to_string = () => `${t.class_name} ${t.method_name}`;
                        t.get_cluster = () => t.hasOwnProperty('cluster_id') ? t.cluster_id : 0;
                        t.get_color = () => t.class_name
                        return t;
                    }),
                    edges: response.coverage.edges.map(e => {
                        e.get_color = () => {
                            let color;
                            switch (e["test_result"]) {
                                case "P":
                                    color = "#03C03C";
                                    break;
                                case "F":
                                    color = "#FF1C00";
                                    break;
                                default:
                                    color = "black";
                                    break;
                            }
                            return color;
                        }
                        e.get_x = () => e.method_id;
                        e.get_y = () => e.test_id;

                        return e;
                    }),
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
        this.setState({selectedProject: "", selectedCommit: "", reset: true});
    }

    updateReset(){
        this.setState({reset: false});
    }
    render() {
        const history = this.state.history;
        const current_filter_map = history[history.length - 1];

        const current_state = process_data(this.state.data, current_filter_map)
        const labelToggle = history.length > 1 ? true : false;

        const handleChange = (panel) => (event, isExpanded) => {
            const expanded = isExpanded ? panel : false;
            this.setState({
                expanded: expanded,
            });
        }

       

        return (
            <div className='test-visualization'>
                {((current_state.x.length >= 0) || (current_state.y.length >= 0)) &&
                    <MatrixVisualization
                        x={current_state.x}
                        y={current_state.y}
                        edges={current_state.edges}
                        onMethodClick={(event, label) => {
                            let new_filter_map = new FunctionMap(current_filter_map);
                            new_filter_map.add_function("filter_by_coexecuted_methods", filter_by_coexecuted_methods, label.to_string())

                            this.setState({
                                history: this.state.history.concat(new_filter_map)
                            })
                        }}
                        onTestClick={(event, label) => {
                            let new_filter_map = new FunctionMap(current_filter_map);
                            new_filter_map.add_function("filter_by_coexecuted_tests", filter_by_coexecuted_tests, label.to_string())

                            this.setState({
                                history: this.state.history.concat(new_filter_map)
                            })
                        }}
                        labelToggle={labelToggle}
                        xlabel={"commits"}/>
                        
                }
                <div id='toolbox'>
                    <h4>Toolbar</h4>
                    <Accordion expanded={this.state.expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector"
                        >
                        <span>Project Selector</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                        <Menu title="Projects" onChange={this.onProjectChange} entries={this.state.projects} reset={this.state.reset} updateReset={this.updateReset}/> 
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={this.state.expanded === 'panel2'} onChange={handleChange('panel2')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector"
                        >
                            <span>Sorting</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                            <Menu
                                title="Sort X-Axis"
                                onChange={(e) => {
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    let func = (data) => data
                                    switch(e.target.value) {
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
                                    new_filter_map.add_function("sorting-x", func);

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }}
                                entries={[
                                { key: 0, value: "Name" },
                                { key: 1, value: "Coverage" },
                                { key: 2, value: "Cluster" },
                                { key: 3, value: "Suspiciousness"}
                                ]}
                                reset={this.state.reset}
                                updateReset={this.updateReset}
                                />
                            <Menu
                                title="Sort Y-Axis"
                                onChange={(e) => {
                                    let new_filter_map = new FunctionMap(current_filter_map);
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
                                    new_filter_map.add_function("sorting-y", func);

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }}
                                entries={[
                                    { key: 0, value: "Name" },
                                    { key: 1, value: "Coverage" },
                                    { key: 2, value: "Cluster" },
                                ]} 
                                reset={this.state.reset}
                                updateReset={this.updateReset}
                                />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={this.state.expanded === 'panel3'} onChange={handleChange('panel3')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector">
                            <span>Test Filters</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                            <Menu title="Test Type"
                                entries={[{ key: 0, value: "All" }, { key: TEST_TYPES.UNIT, value: TEST_TYPES.UNIT }, { key: TEST_TYPES.INTEGRATION, value: TEST_TYPES.INTEGRATION }, { key: TEST_TYPES.SYSTEM, value: TEST_TYPES.SYSTEM }]}
                                description={["Filter based on type of test:",
                                    "- All: Present all tests.",
                                    "- Unit: Only tests that cover methods within a single class.",
                                    "- Integration: Only tests that cover methods across multiple classes in a single packages.",
                                    "- System: Only tests that cover methods across multiple packages."
                                ]}
                                onChange={(event) => {
                                    const test_type = event.target.value;
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("filter_by_test_type", filter_by_test_type, test_type)

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} 
                                reset={this.state.reset}
                                updateReset={this.updateReset}
                                />
                            <Menu title="Test Pass Filter" 
                                entries={[
                                    { key: 0, value: "All" },
                                    { key: 1, value: TEST_RESULT.PASS },
                                    { key: 2, value: TEST_RESULT.FAIL }
                                ]}
                                description={[
                                    "Filter based on the result of each test case:",
                                    "- All: Present all test cases regardless on passed or failed",
                                    "- Only Pass: Present only passed test cases",
                                    "- Only Fail: Present only failed test cases",
                                ]}
                                onChange={(event, index) => {
                                    const test_result = event.target.value;
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("filter_by_test_passed", filter_by_test_passed, test_result)
                                    
                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} 
                                reset={this.state.reset}
                                updateReset={this.updateReset}
                               />
                            <FilterMenu title="Search Test:" 
                                entries={current_state.y} 
                                onClick={(event) => {
                                    const identifier = event.target.value;
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("filter_by_coexecuted_tests", filter_by_coexecuted_tests, identifier)

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                
                                }} />
                            <FilterSlider title="Number of methods covered by test"
                                defaultValue={0}
                                min={0}
                                max={25}
                                onChange={(_, value) => {
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("filter_by_num_method_covered", filter_by_num_method_covered, value);

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={this.state.expanded === 'panel4'} onChange={handleChange('panel4')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="data-set-selector"
                        >
                            <span>Method Filters</span>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-block">
                            <FilterMenu 
                                title="Search Method:"
                                entries={current_state.x}
                                onClick={(event) => {
                                    const identifier = event.target.value;
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("filter_by_coexecuted_methods", filter_by_coexecuted_methods, identifier)

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} />
                            <FilterSlider 
                                title="Number of tests covering a single method:"
                                defaultValue={0}
                                min={0}
                                max={25}
                                onChange={(_, value) => {
                                    let new_filter_map = new FunctionMap(current_filter_map);
                                    new_filter_map.add_function("filter_method_by_number_of_times_tested", filter_method_by_number_of_times_tested, value)

                                    this.setState({
                                        history: this.state.history.concat(new_filter_map)
                                    })
                                }} />
                        </AccordionDetails>
                    </Accordion>

                    <ResultTextBox title="Commits" entries={current_state.x}/>
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

export default HistoryMatrixView;