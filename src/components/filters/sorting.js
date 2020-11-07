import { create_coverage_map } from './filter_utils'

export function sort_by_coverage_X(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    console.log(x, y);
    let x_map = create_coverage_map(edges, (e) => e.method_id, (e) => e.test_id)

    function sort_array(list, map){
        return list.sort((e1, e2) => {
            const id1 = e1.get_id();
            const id2 = e2.get_id();

            const size1 = map.has(id1) ? map.get(id1).size : 0;
            const size2 = map.has(id2) ? map.get(id2).size : 0;

            return size1 < size2
        })
    }

    return {
        "edges": edges,
        "x": sort_array(x, x_map),
        "y": y,
    }
}

export function sort_by_coverage_Y(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let y_map = create_coverage_map(edges, (e) => e.test_id, (e) => e.method_id)

    function sort_array(list, map) {
        return list.sort((e1, e2) => {
            const id1 = e1.get_id();
            const id2 = e2.get_id();

            const size1 = map.has(id1) ? map.get(id1).size : 0;
            const size2 = map.has(id2) ? map.get(id2).size : 0;

            return size1 < size2
        })
    }

    return {
        "edges": edges,
        "x": x,
        "y": sort_array(y, y_map),
    }
}

export function sort_by_suspciousness(current_state, all_data) {

    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let x_map = create_coverage_map(edges, (e) => e.method_id, (e) => e.test_id)

    let test_result_map = new Map()

    edges.forEach(edge => {
        const id = edge.test_id;
        const result = edge.test_result === "P";

        test_result_map.set(id, result)
    });

    let total_tests_failed = 0;
    let total_tests_passed = 0;

    test_result_map.forEach((value, key) => {
        if (value) {
            total_tests_passed += 1;
        } else {
            total_tests_failed += 1;
        }
    });

    function suspiciousness(method) {
        let passed = 0;
        let failed = 0;

        if (!x_map.has(method.get_id())) {
            return -1;
        }

        let tests = x_map.get(method.get_id())

        tests.forEach((test_id) => {
            if (test_result_map.has(test_id) && test_result_map.get(test_id)) {
                passed += 1;
            } else {
                failed += 1;
            }
        });

        return (failed / total_tests_failed) / ((passed/total_tests_passed) + (failed/total_tests_failed))
    }

    function sort_array(list, map) {
        return list.sort((e1, e2) => {
            return suspiciousness(e1) < suspiciousness(e2);
        })
    }

    if (total_tests_failed !== 0 || total_tests_passed !== 0) {
        x = sort_array(x, x_map);
    }

    return {
        "edges": edges,
        "x": x,
        "y": y,
    }
}