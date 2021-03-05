export function create_coverage_map(edges, get_key, get_value) {
    let test_id_map = new Map()

    edges.forEach(edge => {
        const key = get_key(edge)
        const value = get_value(edge)

        if (test_id_map.has(key)) {
            //  Get current Set of methods test covers
            let method_ids = test_id_map.get(key)

            // Add new method id to set and update map
            method_ids.add(value)
            test_id_map.set(key, method_ids)

        } else {
            let method_ids = new Set();
            method_ids.add(value);
            test_id_map.set(key, method_ids)
        }
    });
    return test_id_map;
}