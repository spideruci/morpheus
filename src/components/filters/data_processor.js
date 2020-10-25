export function process_data (data, fmap) {
    let filtered_data = data;
    fmap.get_map().forEach((func) => {
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