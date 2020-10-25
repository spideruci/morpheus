import { create_coverage_map } from './filter_utils'

export function filter_method_by_number_of_times_tested(current_state, all_data, value) {
    const edges = current_state.edges;

    // Map method_id to tests its covered by.
    let method_id_map = create_coverage_map(edges, (e) => e.method_id, (e) => e.test_id)

    const methods = current_state.x.filter((m) => {
        const method_id = m.get_id();
        return (value === 0) || (method_id_map.has(method_id) && (method_id_map.get(method_id).size >= value));
    })

    const filtered_edges = current_state.edges.filter((edge) => {
        const method_id = edge.method_id;
        return (value === 0) || (method_id_map.has(method_id) && (method_id_map.get(method_id).size >= value));
    });

    
    return {
        x: methods,
        y: current_state.y,
        edges: filtered_edges,
    }
}


export function filter_by_coexecuted_methods(current_state, all_data, identifier) {
    const current = current_state;

    let methods = current.x;
    let test_cases = current.y;
    let edges = current.edges;

    let filter_method = methods.find(m => `${m.package_name}.${m.class_name}.${m.method_decl}`.includes(identifier));

    if (filter_method === undefined) {
        filter_method = methods.find(m => m.get_id() === parseInt(identifier));
    }

    if (filter_method === undefined) {
        console.error("Filter Method was not found...");
        return current;
    }

    const test_ids = edges.filter(edge => filter_method.get_id() === edge.method_id)
        .map(edge => edge.test_id);

    const filtered_tests = test_cases.filter(test => test_ids.includes(test.test_id))

    const filtered_edges = edges.filter(
        edge => test_ids.includes(edge.test_id) || edge.method_id === filter_method.method_id)

    const method_ids = filtered_edges.map(edge => edge.method_id)

    const filtered_methods = methods.filter(method => method_ids.includes(method.method_id));

    return {
        x: filtered_methods,
        y: filtered_tests,
        edges: filtered_edges
    }
}