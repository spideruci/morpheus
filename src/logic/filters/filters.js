export const filterByCoOccurence = (methodName) => {
    return (coverage, globalCoverage) => {
        const {x, y, edges} = coverage;

        let filterX = x.find(m => m.toString() === methodName);

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

export const TEST_TYPE = {
    UNIT: 'UNIT_TEST',
    INTEGRATION: 'INTEGRATION',
    SYSTEM: 'SYSTEM'
}

export const filterByTestResult = (testResult) => {
    return (coverage, globalCoverage) => {
        const { x, y, edges } = coverage;

        if (typeof testResult !== "boolean") {
            return coverage;
        }

        const new_edges = edges.filter((edge) => edge.test_result === testResult);
        const test_ids = new_edges.map(edge => parseInt(edge.getY()))

        const newY = y.filter((test) => test_ids.includes(parseInt(test.getID())))

        return {
            x: x,
            y: newY,
            edges: edges,
        }
    }
}

export const filterByTestType = (testType) => {
    return (coverage, globalCoverage) => {
        const { x, y, edges } = coverage;

        return {
            x: x,
            y: y,
            edges: edges,
        }
    }
}


// const createCoverageMap = (edges, get_key, get_value) => {
//     let test_id_map = new Map()

//     edges.forEach(edge => {
//         const key = get_key(edge)
//         const value = get_value(edge)

//         if (test_id_map.has(key)) {
//             //  Get current Set of methods test covers
//             let method_ids = test_id_map.get(key)

//             // Add new method id to set and update map
//             method_ids.add(value)
//             test_id_map.set(key, method_ids)

//         } else {
//             let method_ids = new Set();
//             method_ids.add(value);
//             test_id_map.set(key, method_ids)
//         }
//     });
//     return test_id_map;
// }