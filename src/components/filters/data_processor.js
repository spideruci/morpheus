import { cloneDeep} from 'lodash';

export function process_data (data, fmap) {
    let filtered_data = {
        x: cloneDeep(data.x),
        y: cloneDeep(data.y),
        edges: cloneDeep(data.edges),
    };
    fmap.get_map().forEach((func, index) => {
        filtered_data = func(filtered_data, data);
    })
    return filtered_data
}

export class FunctionMap {
    constructor(fmap) {
        if (fmap !== undefined){
            const m = fmap.get_map();
            this.map = new Map(m);
        } else {
            this.map = new Map();
        }
    }

    add_function(function_id, func, ...args) {
        if (this.map.has(function_id)) {
            this.map.delete(function_id);
        }

        const wrapped_func = (state, data) => func(state, data, ...args)
        this.map.set(function_id, wrapped_func);
    }

    get_function(function_id) {
        if (this.map.has(function_id)) {
            return this.map.get(function_id)
        }
        return;
    }

    get_map(){
        return this.map;
    }
}