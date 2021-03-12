import { create_coverage_map } from './filter_utils'

export function sort_by_coverage_X(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let x_map = create_coverage_map(edges, (e) => e.getX(), (e) => e.getY())

    function sort_array(list, map){
        return list.sort((e1, e2) => {
            const id1 = e1.getID();
            const id2 = e2.getID();

            const size1 = map.has(id1) ? map.get(id1).size : 0;
            const size2 = map.has(id2) ? map.get(id2).size : 0;

            if (size1 < size2) {
                return 1;
            }
            else if (size1 > size2){
                return -1;
            }
            else {
                return 0;
            }
        })
    }
    return {
        "x": sort_array(x, x_map),
        "y": y,
        "edges": edges,
    }
}

export function sort_by_coverage_Y(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let y_map = create_coverage_map(edges, (e) => e.getY(), (e) => e.getX())

    function sort_array(list, map) {
        return list.sort((e1, e2) => {
            const id1 = e1.getID();
            const id2 = e2.getID();

            const size1 = map.has(id1) ? map.get(id1).size : 0;
            const size2 = map.has(id2) ? map.get(id2).size : 0;

            if (size1 < size2) {
                return 1;
            }
            else if (size1 > size2) {
                return -1;
            }
            else {
                return 0;
            }
        })
    }

    return {
        "edges": edges,
        "x": x,
        "y": sort_array(y, y_map),
    }
}


export function sort_by_cluster_X(current_state, all_data) {
    let x = current_state.x;
    const y = current_state.y;
    const edges = current_state.edges;

    return {
        x: x.sort((e1, e2) => {
            if (e1.get_cluster() < e2.get_cluster()){
                return 1;
            } else if(e1.get_cluster() > e2.get_cluster()) {
                return -1
            } else {
                return 0;
            }}),
        y: y,
        edges: edges,
    }
}

export function sort_by_cluster_Y(current_state, all_data) {
    const x = current_state.x;
    let y = current_state.y;
    const edges = current_state.edges;

    return {
        x: x,
        y: y.sort((e1, e2) => {
            if (e1.get_cluster() < e2.get_cluster()) {
                return 1;
            } else if (e1.get_cluster() > e2.get_cluster()) {
                return -1
            } else {
                return 0;
            }
        }),
        edges: edges,
    }
}

export function sort_by_suspciousness(current_state, all_data) {
    let x = current_state.x;
    let y = current_state.y;
    const edges = current_state.edges;

    // suspiciousness map
    let suspciousness_map = new Map();

    // Create Maps One method id to test id and one test id to test result
    let x_map = create_coverage_map(all_data.edges, (e) => e.method_id, (e) => e.test_id)
    let test_result_map = new Map()

    // Create a map of testing results 'test_id' --> result
    all_data.edges.forEach(edge => {
        const id = edge.test_id;
        const result = edge.test_result === "P";
        test_result_map.set(id, result)
    });

    // Compute the number tests passed/failed.
    let total_tests_failed = 0;
    let total_tests_passed = 0;

    test_result_map.forEach((value, key) => {
        if (value) {
            total_tests_passed += 1;
        } else {
            total_tests_failed += 1;
        }
    });


    // Tarantula Suspciousness calculation
    function suspiciousness(method) {
        let passed = 0;
        let failed = 0;

        if (!x_map.has(method.getID())) {
            return -1;
        }

        let tests = x_map.get(method.getID())

        // Compute passed/failed testcases
        tests.forEach((test_id) => {
            if (test_result_map.has(test_id) && test_result_map.get(test_id)) {
                passed += 1;
            } else {
                failed += 1;
            }
        });

        return (failed / total_tests_failed) / ((passed/total_tests_passed) + (failed/total_tests_failed))
    }

    // Sort based on suspiciosness of each test
    function sort_array(list) {
        return list.sort((e1, e2) => {
            const s1 = suspciousness_map.get(e1.getID())
            const s2 = suspciousness_map.get(e2.getID())

                if (s1 < s2) {
                    return 1;
                } else if (s1 > s2){
                    return -1
                } else {
                    return 0;
                }
            }
        )
    }

    // If all tests fail or all tests pass don't compute suspciousness score, because it will fail.
    if (total_tests_failed !== 0 && total_tests_passed !== 0) {
        all_data.x.forEach((elem) => {
            suspciousness_map.set(elem.getID(), suspiciousness(elem));
        });
        x = sort_array(x);
    }

    return {
        "edges": edges,
        "x": x,
        "y": y,
    }
}