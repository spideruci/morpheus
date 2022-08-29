import { create_coverage_map } from '../util/coverage_map';

export function sortMethodsByName (axis, current_state, all_data) {
    return axis.sort((a, b) => a.toString() < b.toString())
}

export function sortMethodsByCoverage(axis, current_state, all_data) {
    const {edges} = current_state;

    let x_map = create_coverage_map(edges, (e) => e.getX(), (e) => e.getY())

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
    return sort_array(axis, x_map)
}

export function sortMethodsBySuspiciousness(axis, current_state, all_data) {
    // suspiciousness map
    let suspciousness_map = new Map();

    // Create Maps One method id to test id and one test id to test result
    let x_map = create_coverage_map(all_data.coverage.edges, (e) => e.method_id, (e) => e.test_id)
    let test_result_map = new Map()

    // Create a map of testing results 'test_id' --> result
    all_data.coverage.edges.forEach(edge => {
        const id = edge.test_id;
        const result = edge.getProperty("test_result");
        test_result_map.set(id, result)
    });

    // Compute the number tests passed/failed.
    let total_tests_failed = 0;
    let total_tests_passed = 0;

    test_result_map.forEach((value, key) => {
        console.log(value)
        if (value) {
            total_tests_passed += 1;
        } else {
            total_tests_failed += 1;
        }
    });

    // Tarantula Suspiciousness calculation
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

        return (failed / total_tests_failed) / ((passed / total_tests_passed) + (failed / total_tests_failed))
    }

    // Sort based on suspiciosness of each test
    function sort_array(list) {
        return list.sort((e1, e2) => {
            const s1 = suspciousness_map.get(e1.getID())
            const s2 = suspciousness_map.get(e2.getID())

            if (s1 < s2) {
                return 1;
            } else if (s1 > s2) {
                return -1
            } else {
                return 0;
            }
        }
        )
    }

    // If no test failed, or if all tests passed, then there is no information to compute suspiciousness.
    if (total_tests_failed === 0 || total_tests_passed === all_data.coverage.y.length - 1) {
        console.warn("No info to compute suspiciousness, so sort by methods name.")
        return sortMethodsByName(axis, current_state, all_data);
    }

    // Compute suspiciousness scores and sort axis.
    all_data.coverage.x.forEach((elem) => {
        suspciousness_map.set(elem.getID(), suspiciousness(elem));
    });
    return sort_array(axis);
}

