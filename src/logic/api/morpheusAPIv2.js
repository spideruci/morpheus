import { json } from 'd3';
import { API_ROOT } from './api-config';

const STATIC_API = {
    fetchProjects: () => `${process.env.PUBLIC_URL}/data/projects.json`,
    fetchCommits: (project_id) => `${process.env.PUBLIC_URL}/data/projects/${project_id}/commits.json`,
    fetchCoverage: (project_id, commit_id) => `${process.env.PUBLIC_URL}/data/coverage/projects/${project_id}/commits/${commit_id}.json`,
    fetchTestHistory: (project_id, test_id) => `${process.env.PUBLIC_URL}/data/data/coverage/projects/${project_id}/tests/${test_id}.json`,
    fetchMethodHistory: (project_id, method_id) => `${process.env.PUBLIC_URL}/data/coverage/projects/${project_id}/methods/${method_id}.json`
}

const DYNAMIC_API = {
    fetchProjects: () => `${API_ROOT}/projects.json`,
    fetchCommits: (project_id) => `${API_ROOT}/projects/${project_id}/commits.json`,
    fetchCoverage: (project_id, commit_id) => `${API_ROOT}/coverage/projects/${project_id}/commits/${commit_id}.json`,
    fetchTestHistory: (project_id, test_id) => `${API_ROOT}/data/coverage/projects/${project_id}/tests/${test_id}.json`,
    fetchMethodHistory: (project_id, method_id) => `${API_ROOT}/coverage/projects/${project_id}/methods/${method_id}.json`
}

const API = process.env.hasOwnProperty('REACT_APP_DYNAMIC') ? DYNAMIC_API : STATIC_API;

export const fetchProjects = () => {
    return json(API.fetchProjects())
        .then((response) => {
            return response.projects;
        })
        .catch(console.error);
}

export const fetchCommits = (project_id) => {
    return json(API.fetchCommits(project_id))
        .then((response) => {
            return response.commits;
        })
}

export const fetchCoverage = (project_id, commit_id) => {
    return json(API.fetchCoverage(project_id, commit_id))
        .then((response) => {
            let methods = response.coverage.methods;
            let tests = response.coverage.tests;
            let edges = response.coverage.edges;

            if (methods.length === 0 || tests.length === 0 || edges.length === 0) {
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
    console.debug(`fetchTestHistory: ${API_ROOT}/coverage/projects/${project_id}/tests/${test_id}`);
    return json(API.fetchTestHistory(project_id, test_id))
        .then((response) => {
            let methods = response.coverage.methods;
            let commits = response.coverage.commits;
            let edges = response.coverage.edges;

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
    console.debug(`${process.env.PUBLIC_URL}/data/coverage/projects/${project_id}/methods/${method_id}.json`)
    return json(API.fetchMethodHistory(project_id, method_id))
        .then((response) => {
            console.debug(response)
            let tests = response.coverage.tests;
            let commits = response.coverage.commits;
            let edges = response.coverage.edges;

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