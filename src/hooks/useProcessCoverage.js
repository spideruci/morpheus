import { useState, useEffect } from 'react';

const sortCoverage = (coverage, state) => {
    const { x, y, edges } = coverage;
    return {
        x: [...x].sort(state.sort.x.func),
        y: [...y].sort(state.sort.y.func),
        edges: edges
    }
}

const filterCoverage = (coverage, state) => {
    const { filters } = state;

    let filteredCoverage = {
        x: [...coverage.x],
        y: [...coverage.y],
        edges: [...coverage.edges]
    }

    for (const [, filterEntry] of Object.entries(filters)) {
        filteredCoverage = filterEntry(filteredCoverage, coverage);
    }

    return filteredCoverage;
}

export const useProcessCoverage = (state) => {
    const [coverage, setCoverage] = useState(state);

    useEffect(() => {
        let processedCoverage = sortCoverage(filterCoverage(state.coverage, state), state);

        setCoverage(processedCoverage);
    }, [
        state,
        state.coverage.x,
        state.coverage.y,
        state.coverage.edges,
        state.sort.x,
        state.sort.y,
        state.filters
    ])

    return coverage;
}