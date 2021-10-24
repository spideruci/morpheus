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

    getID = () => this.id;
    getColor = () => 'black';
    getPackageName = () => this.packageName;
    getClassName = () => this.className;
    getMethodName = () => this.methodDecl;
    toString = () => `${this.packageName} ${this.className} ${this.methodDecl}`;
}

export class Test {
    constructor(id, packageName, className, testName) {
        this.id = parseInt(id);
        this.packageName = packageName;
        this.className = className;
        this.testName = testName;
    }

    getID = () => this.id;
    getColor = () => 'black';
    getPackageName = () => this.packageName;
    getClassName = () => this.className;
    getMethodName = () => this.testName;
    toString = () => `${this.packageName} ${this.className} ${this.testName}`;
}

export class Commit {
    constructor(id, sha, date, author) {
        this.id = id;
        this.sha = sha;
        this.date = new Date(date);
        this.author = author;
    }

    getID = () => this.id;
    getColor = () => 'black';
    getAuthor = () => this.author;
    getDate = () => this.date;
    getSHA = () => this.sha;
    toString = () => {
        const short_sha = this.sha.slice(this.sha.length - 7, this.sha.length);
        const date = this.date.toDateString();
        return `${short_sha}, ${date}`;
    }
}