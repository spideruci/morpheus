import { Edge, Method, Test } from "../api/MorpheusTypes";
import { schemeSet3 } from "d3-scale-chromatic";
import { scaleOrdinal } from "d3-scale";
import { create_coverage_map } from "../util/coverage_map";

export const COLOR_SCHEMES = {
    TEST_RESULT: 'Test Result',
    TEST_TYPE: 'Test Type'
}

/*********************************************************************
 * Configuration functions
 ********************************************************************/

/**
 * 
 * @param {*} coverageType, Test, method, or coverage history. 
 * @param {*} colorSet, What type of coloring scheme you want to use, e.g., test result or type.
 * @param {*} coverage, All coverage information
 */
export const setColorScheme = (colorScheme, coverageType,  currentCoverage, globalCoverage) => {

    if (coverageType === "COVERAGE"){
        if (colorScheme === COLOR_SCHEMES.TEST_RESULT || colorScheme === null) {
            const {x, y, edges} = currentCoverage;
            METHOD_COLOR_FUNCTIONS.package_name({methods: x});
            TEST_COLOR_FUNCTIONS.package_name({tests: y});
            EDGES_COLOR_FUNCTIONS.test_result({edges: edges});
        }
        else if (colorScheme === COLOR_SCHEMES.TEST_TYPE) {
            const {x, y} = currentCoverage;
            const test_type_map = createTestTypeMap(globalCoverage, currentCoverage);

            METHOD_COLOR_FUNCTIONS.package_name({methods: x});
            TEST_COLOR_FUNCTIONS.package_name({tests: y});
            EDGES_COLOR_FUNCTIONS.test_type({test_type_map: test_type_map});
        }
    }
    else if (coverageType === "METHOD_HISTORY"){
        const {y, edges} = currentCoverage;
        TEST_COLOR_FUNCTIONS.package_name({tests: y});
        EDGES_COLOR_FUNCTIONS.test_result({edges: edges});
    }
    else if (coverageType === "TEST_HISTORY"){
        const {y, edges} = currentCoverage;
        METHOD_COLOR_FUNCTIONS.package_name({methods: y});
        EDGES_COLOR_FUNCTIONS.test_result({edges: edges});   
    }
    else {
        console.warn(`Coverage type ${coverageType} not found...`)
    }
}

/*********************************************************************
 * Color scheme functions
 ********************************************************************/

const METHOD_COLOR_FUNCTIONS = {
    package_name: ({methods}) => {
        if (methods.length > 0 && methods[0].constructor.name === Method.name) {
            let unique_method_packages = new Set(methods.map((method) => method.getPackageName()));
            const colorX = (d) => {
                const scale = scaleOrdinal(schemeSet3).domain(Array.from(unique_method_packages));
                return scale(d);
            }

            Method.prototype.getColor = function () {
                return colorX(this.getPackageName());
            };
        }
    }
}

const TEST_COLOR_FUNCTIONS = {
    package_name: ({tests}) => {
        if (tests.length > 0 && tests[0].constructor.name === Test.name) {
            let unique_tests_packages = new Set(tests.map((test) => test.getPackageName()));
            const colorY = (d) => {
                const scale = scaleOrdinal(schemeSet3).domain(Array.from(unique_tests_packages));
                return scale(d);
            }

            Test.prototype.getColor = function () {
                return colorY(this.getPackageName());
            };
        }
    },
    test_type: ({test_type_map}) => {
        Test.prototype.getColor = function() {
            switch (test_type_map.get(this.getID())) {
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
}

const EDGES_COLOR_FUNCTIONS = {
    test_result: ({edges}) => {
        if (edges.length > 0 && edges[0].constructor.name === Edge.name) {
            Edge.prototype.getColor = function () {
                return this.getProperty('test_result') ? '#03C03C' : '#FF1C00'
            };
        }
    },
    test_type: ({test_type_map}) => {
        Edge.prototype.getColor = function() {
            switch (test_type_map.get(this.getY())) {
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
}

/******************************************
 * Helper functions
 *****************************************/

function createTestTypeMap(global, current) {
    const {edges} = global;

    let {x, y} = current;

    let newX = [];

    for (const element of x) {
        element.boo = Math.random();
        newX.push(element)
    }

    const test_to_meth_map = create_coverage_map(edges, e => e.getY(), e => e.getX())

    let test_id_to_type_map = new Map();

    let map_method_id = new Map();
    x.forEach((m) => {
        map_method_id.set(m.getID(), m)
    })

    y.forEach(function(t, index, array) {
        const test_id = t.getID();
        const method_ids = test_to_meth_map.get(test_id)
        let package_set = new Set();
        let class_set = new Set();

        method_ids.forEach((id) => {
            const method = map_method_id.get(id);
            if (method === undefined) {
                return;
            }
            let package_name = method.getPackageName();
            let class_name = method.getClassName();
            package_set.add(package_name)
            class_set.add(`${package_name}.${class_name}`)
        });

        if (package_set.size > 1) {
            test_id_to_type_map.set(t.getID(), "S");
        }
        else if (package_set.size === 1 && class_set.size > 1) {
            test_id_to_type_map.set(t.getID(), "I");
        }
        else if (class_set.size === 1) {
            test_id_to_type_map.set(t.getID(), "U");
        }
    });

    return test_id_to_type_map;
}