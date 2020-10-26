import { create_coverage_map } from './filter_utils'

export function filter_by_num_method_covered(current_state, all_data, value) {
    const edges = current_state.edges;

     // Map test_id to methods it covers
    let test_id_map = create_coverage_map(edges, (e) => e.test_id, e => e.method_id);

    const tests = current_state.y.filter((test) => {
        const test_id = test.get_id();
        return (value === 0) || (test_id_map.has(test_id) && (test_id_map.get(test_id).size >= value));
    })

    const filtered_edges = current_state.edges.filter((edge) => {
        const test_id = edge.test_id;
        return (value === 0) || (test_id_map.has(test_id) && (test_id_map.get(test_id).size >= value));
    });

    return {
        x: current_state.x,
        y: tests,
        edges: filtered_edges,
    }
}


export function filter_by_test_passed(current_state, all_data, value) {
    function test_filter(current_state, predicate) {
        const methods = current_state.x;
        const tests = current_state.y;
        const edges = current_state.edges;

        const new_edges = edges.filter(predicate)
        const test_ids = new_edges.map(edge => edge.test_id)

        const new_tests = tests.filter((test) => test_ids.includes(test.test_id))

        return {
            x: methods,
            y: new_tests,
            edges: new_edges,
        }
    }

    let new_state;
    switch (value) {
        case TEST_RESULT.PASS:
            console.info(`Filter all test methods that fail Index: ${value}, was chosen.`);
            new_state = test_filter(current_state, (edge) => edge.test_result)
            break;
        case TEST_RESULT.FAIL:
            console.info(`Filter all test methods that pass Index: ${value}, was chosen.`);
            new_state = test_filter(current_state, (edge) => !edge.test_result)
            break;
        default:
            console.info(`No methods have been filtered. Index: ${value}, was chosen.`);
            new_state = current_state;
    }

    return new_state;
}


export function filter_by_coexecuted_tests(current_state, all_data, identifier) {
    const current = current_state;

    let methods = current.x;
    let test_cases = current.y;
    let edges = current.edges;

    let filter_test = test_cases.find(test => `${test.class_name}.${test.method_name}`.includes(identifier));

    if (filter_test === undefined) {
        filter_test = test_cases.find(test => test.get_id() === parseInt(identifier));
    }

    if (filter_test === undefined) {
        console.error("Filter Method was not found...");
        return current;
    }

    const method_ids = edges.filter(edge => filter_test.test_id === edge.test_id)
        .map(edge => edge.method_id);

    const filtered_methods = methods.filter(m => method_ids.includes(m.method_id))

    const filtered_edges = edges.filter(
        edge => method_ids.includes(edge.method_id) || edge.test_id === filter_test.test_id)

    const test_ids = filtered_edges.map(edge => edge.test_id)

    const filtered_tests = test_cases.filter(test => test_ids.includes(test.test_id));

    return {
        x: filtered_methods,
        y: filtered_tests,
        edges: filtered_edges
    }
}

export function filter_by_test_type(current_state, all_data, test_type) {
    let filter_type;
    switch (test_type) {
        case TEST_TYPES.UNIT:
            filter_type = (p, c) => c.size === 1;
            break;
        case TEST_TYPES.INTEGRATION:
            filter_type = (p, c) => p.size === 1 && c.size > 1
            break;
        case TEST_TYPES.SYSTEM:
            filter_type = (p, c) => p.size > 1;
            break;
        default:
            return current_state;
    }
    return test_type_filter(current_state, all_data, filter_type);
}


function test_type_filter(current_state, all_data, filter) {
    const methods = current_state.x;

    let map_method_id = new Map();
    methods.forEach((m) => {
        map_method_id.set(m.method_id, m)
    })

    const edges = current_state.edges;
    const test_to_meth_map = create_coverage_map(all_data.edges, e => e.test_id, e => e.method_id)

    const tests = current_state.y;

    let new_tests, new_edges, new_test_ids;

    new_tests = tests.filter((t) => {
        const test_id = t.test_id;
        const method_ids = test_to_meth_map.get(test_id)
        let package_set = new Set();
        let class_set = new Set();

        method_ids.forEach((id) => {
            const method = map_method_id.get(id);
            package_set.add(`${method.package_name}`)
            class_set.add(`${method.package_name}.${method.class_name}`)
        });

        return filter(package_set, class_set);
    });

    new_test_ids = new_tests.map(test => test.test_id);

    new_edges = edges.filter((edge) => {
        return new_test_ids.includes(edge.test_id)
    });

    return {
        x: methods,
        y: new_tests,
        edges: new_edges,
    }
}

export const TEST_TYPES = {
    UNIT: 'Unit',
    INTEGRATION: 'Integration',
    SYSTEM: 'System',
}

export const TEST_RESULT = {
    PASS: 'Only Pass',
    FAIL: 'Only Fail'
}
