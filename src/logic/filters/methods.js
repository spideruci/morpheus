import { create_coverage_map } from '../util/coverage_map';

export const filterByCoOccurence = (method) => {
    return (coverage, globalCoverage) => {
        const {x, y, edges} = coverage;
        let filterX = x.find(m => m.getMethodName() === method.getMethodName());

        if (filterX === undefined) {
            return coverage;
        }
        
        const yIDs = edges.filter((edge) => edge.getX() === parseInt(filterX.getID()))
            .map((edge) => edge.getY());

        const filteredY = y.filter(yElem => yIDs.includes(parseInt(yElem.getID())));
        const filteredYIds = filteredY.map(elem => parseInt(elem.getID()));

        const filteredEdges = edges.filter(edge => filteredYIds.includes(edge.getY()));

        const filteredXIds = filteredEdges.map(edge => edge.getX());

        const filteredX = x.filter(xElem => filteredXIds.includes(parseInt(xElem.getID())));

        return {
            x: filteredX,
            y: filteredY,
            edges: filteredEdges,
        }
    }
}

export const filterByTestResult = (testResult) => {
    return (coverage, globalCoverage) => {
        const { x, y, edges } = coverage;
        if (typeof testResult !== "boolean") {
            return coverage;
        }

        const new_edges = edges.filter((edge) => edge.getProperty("test_result") === testResult);
        const test_ids = new_edges.map(edge => parseInt(edge.getY()))

        const newY = y.filter((test) => test_ids.includes(parseInt(test.getID())))

        return {
            x: x,
            y: newY,
            edges: new_edges,
        }
    }
}

export const TEST_TYPES = {
    ALL: 'All',
    UNIT: 'Unit',
    INTEGRATION: 'Integration',
    SYSTEM: 'System',
}

export const filterByTestType = (testType) => {
    return (coverage, globalCoverage) => {
        let filter_type;
        switch (testType) {
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
                return coverage;
        }
        return test_type_filter(coverage, globalCoverage, filter_type);
    }
}

function test_type_filter(current_state, all_data, is_of_test_type) {
    const { x, y, edges } = current_state;

    const create_id_map = (objectList) => {
        let object_id_map = new Map();
        objectList.forEach((x) => {
            object_id_map.set(x.getID(), x);
        })
        return object_id_map;
    };

    let map_method_id = create_id_map(x);
    
    const y_to_x_map = create_coverage_map(all_data.edges, e => e.getY(), e => e.getX())
    let new_tests, new_edges, new_test_ids;

    new_tests = y.filter((t) => {
        const method_ids = y_to_x_map.get(t.getID())
        let package_set = new Set();
        let class_set = new Set();

        method_ids.forEach((id) => {
            const method = map_method_id.get(id);
            if (method === undefined) {
                return;
            }
            package_set.add(method.getPackageName())
            class_set.add(`${method.getPackageName()}.${method.getClassName()}`)
        });

        return is_of_test_type(package_set, class_set);
    });

    new_test_ids = new_tests.map(test => test.getID());

    new_edges = edges.filter((edge) => {
        return new_test_ids.includes(edge.getY())
    });

    const x_covered = new_edges.map(e => e.getX());

    let new_x = x.filter((x) => {
        return x_covered.includes(x.getID())
    });

    return {
        x: new_x,
        y: new_tests,
        edges: new_edges,
    }
}

export function filterByCoexecutedMethods(current_state, _, identifier) {
    const current = current_state;

    let methods = current.x;
    let test_cases = current.y;
    let edges = current.edges;

    let filter_method = methods.find(m => m.toString().includes(identifier));

    if (filter_method === undefined) {
        filter_method = methods.find(m => m.getID() === parseInt(identifier));
    }

    if (filter_method === undefined) {
        console.error("Filter Method was not found...");
        return current;
    }

    const filtered_method_id = filter_method.getID();

    const test_ids = edges.filter(edge => filtered_method_id === edge.method_id)
        .map(edge => edge.test_id);

    const filtered_tests = test_cases.filter(test => test_ids.includes(test.test_id))

    const filtered_edges = edges.filter(
        edge => test_ids.includes(edge.test_id) || edge.method_id === filter_method.method_id)

    filtered_edges.forEach((edge) => {
        if (edge.method_id === filtered_method_id) {
            edge.highlight = true;
        }
    })

    const method_ids = filtered_edges.map(edge => edge.method_id)

    const filtered_methods = methods.filter(method => method_ids.includes(method.method_id));

    return {
        x: filtered_methods,
        y: filtered_tests,
        edges: filtered_edges
    }
}