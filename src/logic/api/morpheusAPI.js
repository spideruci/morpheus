import { json } from 'd3';
import { API_ROOT } from './api-config';

export const fetchProjects = () => {
    console.debug("Test...")
    return json(`${API_ROOT}/projects`)
        .then((response) => {
            return response.projects.map(project => {
                return { key: project.id, value: project.project_name };
            });
        })
        .catch(console.error);
}

export const fetchCommits = (project_name) => {
    return json(`${API_ROOT}/commits/${project_name}`)
        .then((response) => {
            return response.commits.map(commit => {
                return { key: commit.id, value: commit.sha, display: commit.sha }
            });
        })
        .catch(console.error);
}

export const fetchCoverage = (project_name, commit_sha) => {
    return json(`${API_ROOT}/coverage/${project_name}/${commit_sha}`)
        .then((response) => {
            return {
                methods: response.coverage.methods.map(m => {
                    m.get_id = () => m.method_id;
                    m.to_string = () => `${m.package_name}.${m.class_name} ${m.method_decl}`;
                    m.get_cluster = () => m.hasOwnProperty('cluster_id') ? m.cluster_id : 0;
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
        .catch(console.error);
}