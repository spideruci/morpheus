import { json } from 'd3';

export const fetchProjects = () => {
    let projects = [
        { key: 0, value: 'commons-cli-experiment-9722ec17bf9dbd1deab299bdd6dfe038fedae3bd' },
        { key: 1, value: 'jpacman-framework-2434427914fa957f65617a9e794510f0c6ada9f9' },
        { key: 2, value: 'commons-io-29b70e156f9241b0c3e25896c931d1ef8725ad66' },
        { key: 3, value: 'jsoup-89580cc3d25d0d89ac1f46b349e5cd315883dc79' },
        { key: 4, value: 'maven-7a4b77b582913aad0ee941df8e86a5b83bc3eec8' } 
    ]
    return projects;
}

export const fetchCoverage = (project_name) => {
    return json(`${process.env.PUBLIC_URL}/resources/${project_name}.json`)
        .then((response) => {
            return {
                methods: response.coverage.methods.map(m => {
                    m.get_id = () => m.method_id;
                    m.to_string = () => `${m.package_name}.${m.class_name} ${m.method_decl}`;
                    m.get_cluster = () => m.hasOwnProperty('cluster_id') ? m.cluster_id : 0;
                    m.get_color = () => m.package_name
                    return m;
                }),
                tests: response.coverage.tests.map(t => {
                    t.get_id = () => t.test_id;
                    t.to_string = () => `${t.class_name} ${t.method_name}`;
                    t.get_cluster = () => t.hasOwnProperty('cluster_id') ? t.cluster_id : 0;
                    t.get_color = () => t.class_name
                    return t;
                }),
                edges: response.coverage.edges.map(e => {
                    e.get_color = () => {
                        switch (e["test_result"]) {
                            case "P":
                                return "#03C03C";
                            case "F":
                                return "#FF1C00";
                            default:
                                return "black";
                        }
                    }
                    e.get_x = () => e.method_id;
                    e.get_y = () => e.test_id;

                    return e;
                }),
            }
        })
        .catch(console.error);
}