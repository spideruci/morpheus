export function filterByCoexecutedTests(test) {
    return (coverage, globalCoverage) => {
        const {x, y, edges} = coverage;
        const identifier = test.getID();

        const filter_test = y.find(test => test.getID() === parseInt(identifier));

        if (filter_test === undefined) {
            console.error("Filter Method was not found...");
            return coverage;
        }

        const filtered_test_id = filter_test.getID();

        const method_ids = edges.filter(edge => filtered_test_id === edge.getY())
            .map(edge => edge.getX());

        const filtered_methods = x.filter(m => method_ids.includes(m.getID()))

        let filtered_edges = edges.filter(
            edge => method_ids.includes(edge.getX()) || edge.getY() === filtered_test_id)

        filtered_edges.forEach((edge) => {
            if (edge.test_id === filtered_test_id) {
                edge.highlight = true;
            }
        })

        const test_ids = filtered_edges.map(edge => edge.getY());

        const filtered_tests = y.filter(test => test_ids.includes(test.getID()));

        console.log("FUCK FUCK", {
            x: filtered_methods,
            y: filtered_tests,
            edges: filtered_edges
        });
        return {
            x: filtered_methods,
            y: filtered_tests,
            edges: filtered_edges
        }
    }
}