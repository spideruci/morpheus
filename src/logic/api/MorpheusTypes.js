export class Project {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }

    getProjectName = () => this.name;
    getID = () => this.id;
    toString = () => this.name;
}

export class Edge {
    constructor(x, y, properties = {}) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.properties = properties;
    }

    getX() { return this.x; };
    getY() { return this.y; };
    getColor() { return this.getProperty('test_result') ? '#03C03C' : "#FF1C00";};
    toString() { return `<Edge x:${this.x}, y:${this.y}>`;}
    getProperty(property) {
        return property in this.properties ? this.properties[property] : null
    };
    setProperty(key, value) {
        this.properties[key] = value
    }
}

export class Method {
    constructor(id, packageName, className, methodName, methodDecl, filePath) {
        this.id = parseInt(id);
        this.packageName = packageName;
        this.className = className;
        this.methodName = methodName;
        this.methodDecl = methodDecl;
        this.filePath = filePath;
    }

    getID() { return this.id };
    getColor() { return 'black'};
    getPackageName() { return this.packageName};
    getClassName() { return this.className};
    getMethodName() { return this.methodDecl};
    toString() { return `${this.packageName} ${this.className} ${this.methodDecl}`};
}

export class Test {
    constructor(id, packageName, className, testName) {
        this.id = parseInt(id);
        this.packageName = packageName;
        this.className = className;
        this.testName = testName;
        this.properties = {};
    }

    getID() { return this.id };
    getColor() { return 'black' };
    getPackageName() { return this.packageName };
    getClassName() { return this.className };
    getMethodName() { return this.testName };
    toString() { return `${this.packageName} ${this.className} ${this.testName}` };
    getProperty(property) {
        return property in this.properties ? this.properties[property] : null
    };
    setProperty(key, value) {
        this.properties[key] = value
    }
}

export class Commit {
    constructor(id, sha, date, author) {
        this.id = id;
        this.sha = sha;
        this.date = new Date(date);
        this.author = author;
    }

    getID() { return this.id };
    getColor() { return 'black' };
    getAuthor() { return this.author };
    getDate() { return this.date };
    getSHA() { return this.sha};
    toString() {
        const short_sha = this.sha.slice(0, 7);
        const date = this.date.toDateString();
        return `${short_sha}, ${date}`;
    }
}