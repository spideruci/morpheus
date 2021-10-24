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
            let methods = response.coverage.methods;
            let tests = response.coverage.tests;
            let edges = response.coverage.edges;

            if (methods.length === 0 || tests.length === 0 || edges.length === 0 ) {
                console.error(`Nothing to visualize, methods: ${methods.length}, tests: ${tests.length}, edges: ${edges.length}`)
            }

            return {
                methods: methods,
                tests: tests,
                edges: edges
            }
        })
        .catch(console.error);
}

export const fetchTestHistory = (project_id, test_id) => {
    return json(`${API_ROOT}/coverage/projects/${project_id}/tests/${test_id}`)
        .then((response) => {
            let methods = response.coverage.methods;
            let commits = response.coverage.commits;
            let edges = response.coverage.edge;

            if (methods.length === 0 || commits.length === 0 || edges.length === 0) {
                console.error(`Nothing to visualize, methods: ${methods.length}, commits: ${commits.length}, edges: ${edges.length}`)
            }

            return {
                methods: methods,
                commits: commits,
                edges: edges
            }
        })
        .catch(console.error);
}

export const fetchMethodHistory = (project_id, method_id) => {
    return json(`${API_ROOT}/coverage/projects/${project_id}/methods/${method_id}`)
        .then((response) => {
            let tests = response.coverage.tests;
            let commits = response.coverage.commits;
            let edges = response.coverage.edge;

            if (tests.length === 0 || commits.length === 0 || edges.length === 0) {
                console.error(`Nothing to visualize, methods: ${tests.length}, commits: ${commits.length}, edges: ${edges.length}`)
            }

            return {
                tests: tests,
                commits: commits,
                edges: edges
            }
        })
        .catch(console.error);
}