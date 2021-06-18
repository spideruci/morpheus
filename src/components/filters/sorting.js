import { create_coverage_map } from './filter_utils'

export function sort_by_coverage_X(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let x_map = create_coverage_map(edges, (e) => e.get_x(), (e) => e.get_y())

    function sort_array(list, map){
        return list.sort((e1, e2) => {
            const id1 = e1.get_id();
            const id2 = e2.get_id();

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

    let y_map = create_coverage_map(edges, (e) => e.get_y(), (e) => e.get_x())

    function sort_array(list, map) {
        return list.sort((e1, e2) => {
            const id1 = e1.get_id();
            const id2 = e2.get_id();

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

export function color_by_test_type(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let newX = [];

    for (const element of x) {
        element.boo = Math.random();
        newX.push(element)
    }

    const test_to_meth_map = create_coverage_map(all_data.edges, e => e.test_id, e => e.method_id)

    let test_id_to_type_map = new Map();

    let map_method_id = new Map();
    x.forEach((m) => {
        map_method_id.set(m.method_id, m)
    })

    y.forEach(function(t, index, array) {
        const test_id = t.test_id;
        const method_ids = test_to_meth_map.get(test_id)
        let package_set = new Set();
        let class_set = new Set();

        method_ids.forEach((id) => {
            const method = map_method_id.get(id);
            if (method === undefined) {
                return;
            }
            package_set.add(`${method.package_name}`)
            class_set.add(`${method.package_name}.${method.class_name}`)
        });

        if (package_set.size > 1) {
            test_id_to_type_map.set(t.test_id, "S");
        }
        else if (package_set.size === 1 && class_set.size > 1) {
            test_id_to_type_map.set(t.test_id, "I");
        }
        else if (class_set.size == 1) {
            test_id_to_type_map.set(t.test_id, "U");
        }
    });

    for (const edge of edges) {

        const test_type = test_id_to_type_map.get(edge.test_id);
        edge.test_type = test_type

        edge.get_color = () => {
            switch (edge.test_type) {
                case "S":
                    return "#0575eb";
                case "I":
                    return "#eb8c06";
                case "U":
                    return "#02ae5e";
                default:
                    return "black";
            }
        }
    }

    return {
        "edges": edges,
        "x": newX,
        "y": y,
    }
}

export function color_by_test_result(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let newX = [];

    for (const element of x) {
        element.boo = Math.random();
        newX.push(element)
    }

    for (const edge of edges) {
        edge.get_color = () => {
            switch (edge["test_result"]) {
                case "P":
                    return "#03C03C";
                case "F":
                    return "#FF1C00";
                default:
                    return "black";
            }
        }
    }

    return {
        "edges": edges,
        "x": newX,
        "y": y,
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

        if (!x_map.has(method.get_id())) {
            return -1;
        }

        let tests = x_map.get(method.get_id())

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
            const s1 = suspciousness_map.get(e1.get_id())
            const s2 = suspciousness_map.get(e2.get_id())

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
            suspciousness_map.set(elem.get_id(), suspiciousness(elem));
        });
        x = sort_array(x);
    }

    return {
        "edges": edges,
        "x": x,
        "y": y,
    }
}