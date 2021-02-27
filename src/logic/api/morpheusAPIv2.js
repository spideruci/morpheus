import { json } from 'd3';
import { API_ROOT } from './api-config';

export const fetchProjects = () => {
    return json(`${API_ROOT}/projects/`)
        .then((response) => {
            return response.projects.map(project => {
                return { key: project.id, value: project.project_name };
            });
        })
        .catch(console.error);
}

export const fetchCommits = (project_id) => {
    return json(`${API_ROOT}/projects/${project_id}/commits`)
        .then((response) => {
            return response.commits.map(commit => {
                return { key: commit.id, value: commit.sha, display: commit.sha }
            });
        })
}

export const fetchCoverage = (project_id, commit_id) => {
    return json(`${API_ROOT}/coverage/projects/${project_id}/commits/${commit_id}`)
        .then((response) => {
            return {
                methods: response.coverage.methods.map(m => {
                    m.get_id = () => m.id;
                    m.to_string = () => `${m.package_name}.${m.class_name} ${m.method_decl}`;
                    m.get_color = () => m.package_name
                    return m;
                }),
                tests: response.coverage.tests.map(t => {
                    t.get_id = () => t.id;
                    t.to_string = () => `${t.class_name} ${t.method_name}`;
                    t.get_color = () => t.class_name
                    return t;
                }),
                edges: response.coverage.edges.map(e => {
                    e.get_color = () => e.test_result ? "#03C03C" : "#FF1C00";
                    e.get_x = () => e.method_id;
                    e.get_y = () => e.test_id;

                    return e;
                }),
            }
        })
        .catch(console.error);
}