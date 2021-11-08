import { useState, useEffect } from 'react';

const sortCoverage = (coverage, state) => {
    const {x, y, edges} = coverage;
    const { sort } = state;
    
    if (sort.x === undefined || sort.y === undefined) {
        return coverage;
    }

    let sortedCoverage = {
        x: sort.x.func([...x], coverage, state),
        y: sort.y.func([...y], coverage, state),
        edges: [...edges]
    }
    return sortedCoverage;
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
        let processedCoverage = filterCoverage(sortCoverage(state.coverage, state), state);

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