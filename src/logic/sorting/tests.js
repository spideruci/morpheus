import { create_coverage_map } from '../util/coverage_map';

export function sortTestsByName(axis, current_state, all_data) {
    return axis.sort((a, b) => a.toString() < b.toString())
}

export function sortTestsByCoverage(axis, current_state, all_data) {
    const { edges } = current_state;

    let y_map = create_coverage_map(edges, (e) => e.getY(), (e) => e.getX())

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

    return sort_array(axis, y_map);
}