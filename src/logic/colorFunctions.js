import { scaleOrdinal } from 'd3-scale';
import { schemeSet3 } from 'd3-scale-chromatic';


export const getColorFunction = (labels, funcName) => {
    if ((labels === null) || (labels === undefined)) {
        return () => 'black'
    }
    const scale = scaleOrdinal(schemeSet3)
        .domain(
            Array.from(
                new Set(labels.map((d) => d[funcName]()))
            )
        );
    return function (node) {
        return scale(node[funcName]());
    };
}

export const getEdgeColorTest = (edge) => {
    return edge.getProperty('test_result') ? '#03C03C' : "#FF1C00"
}