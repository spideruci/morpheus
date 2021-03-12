import { json } from 'd3';
import { API_ROOT } from './api-config';

export const fetchProjects = () => {
    return json(`${API_ROOT}/projects/`)
        .then((response) => {
            return response.projects;
        })
        .catch(console.error);
}

export const fetchCommits = (project_id) => {
    return json(`${API_ROOT}/projects/${project_id}/commits`)
        .then((response) => {
            return response.commits;
        })
}

export const fetchCoverage = (project_id, commit_id) => {
    return json(`${API_ROOT}/coverage/projects/${project_id}/commits/${commit_id}`)
        .then((response) => {
            return {
                methods: response.coverage.methods,
                tests: response.coverage.tests,
                edges: response.coverage.edges
            }
        })
        .catch(console.error);
}

export const fetchTestHistory = (project_id, test_id) => {
    console.debug(`${API_ROOT}/coverage/projects/${project_id}/tests/${test_id}`)
    return json(`${API_ROOT}/coverage/projects/${project_id}/tests/${test_id}`)
        .then((response) => {
            return {
                methods: response.coverage.methods,
                commits: response.coverage.commits,
                edges: response.coverage.edges
            }
        })
        .catch(console.error);
}

export const fetchMethodHistory = (project_id, method_id) => {
    return json(`${API_ROOT}/coverage/projects/${project_id}/methods/${method_id}`)
        .then((response) => {
            return {
                tests: response.coverage.tests,
                commits: response.coverage.commits,
                edges: response.coverage.edges
            }
        })
        .catch(console.error);
}