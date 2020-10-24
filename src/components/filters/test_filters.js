export function filter_by_num_method_covered (current_state, value) {
     // Map test_id to methods it covers
    let test_id_map = new Map()

    const edges = current_state.edges;

    edges.forEach(edge => {
        if (test_id_map.has(edge.test_id)) {
            //  Get current Set of methods test covers
            let method_ids = test_id_map.get(edge.test_id)

            // Add new method id to set and update map
            method_ids.add(edge.method_id)
            test_id_map.set(edge.test_id, method_ids)

        } else {
            let method_ids = new Set();
            method_ids.add(edge.method_id);
            test_id_map.set(edge.test_id, method_ids)
        }
    })

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


export function filter_by_test_passed(current_state, value) {
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
        case 1: // Present only passing methods
            console.info(`Filter all test methods that fail Index: ${value}, was chosen.`);
            new_state = test_filter(current_state, (edge) => edge.test_result)
            break;
        case 2: // Present only failing methods
            console.info(`Filter all test methods that pass Index: ${value}, was chosen.`);
            new_state = test_filter(current_state, (edge) => !edge.test_result)
            break;
        default:
            console.info(`No methods have been filtered. Index: ${value}, was chosen.`);
            new_state = current_state;
    }

    return new_state;
}


export function filter_by_coexecuted_tests(current_state, identifier) {
    console.log(identifier)
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