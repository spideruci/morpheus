import React, { Component } from 'react';
import { axisTop, axisLeft } from 'd3-axis';
import { scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';


class MatrixVisualization extends Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        // TODO remove historry from here (state in general should be removed.)
        // Currently used for width/height... 
        this.state = {}

        this.margin = {
            top: 100,
            left: 150,
            right: 0,
            bottom: 0
        }

        this.labelToggle = props.hasOwnProperty('labelToggle') ? props['labelOn'] : false;

        this.createMatrix = this.createMatrix.bind(this);
        this.createTestMatrixView = this.createTestMatrixView.bind(this);
        this.update = this.update.bind(this);

        // Set all methods passed through properties here (we don't use bind because we want to make use of the parent this object.)
        this.onMethodClick = this.props.onMethodClick;
        this.onTestClick = this.props.onTestClick;
    }

    updateDimensions() {
        // TODO fix this line, it should not be a hardcoded reference.
        // Goal is to dynamically size the element based on the parent element.
        let visualizationDiv = document.getElementById("visualization");
        return {
            width: visualizationDiv.offsetWidth,
            height: visualizationDiv.offsetHeight,
        }
    }

    createMatrix() {
        const current = {
            x: this.props.x,
            y: this.props.y,
            edges: this.props.edges
        }

        if (current.x.length === 0 || current.y.length === 0) {
            return {
                x_labels: [],
                y_labels: [],
                nodes: []
            };
        }

        let edges = []

        // TODO make this configurable, by adding a get_x(), get_y(), get_z() to the edge objects
        //  It should be possible to dynamically change implementation of the get_x(), get_y(), and get_z() functions.
        current.edges.forEach((edge, index) => {
            if  (!(edge["test_id"] === null || edge["method_id"] === null)){
                edges.push({ x: parseInt(edge["method_id"]), y: parseInt(edge["test_id"]), z: edge["test_result"] ? "#0F0" : "#F00"});
            }
        });

        return {
            x_labels: current.x,
            y_labels: current.y,
            nodes: edges
        };
    }

    componentDidMount() {
        this.createTestMatrixView();
    }

    componentWillReceiveProps(props) {
        let dimensions = this.updateDimensions();

        let newState = {
            width: dimensions.width,
            height: dimensions.height,
        }

        this.setState(newState, this.update);
    }

    update () {
        // Update viewBox to the state width and height
        const node = this.ref.current;
        let svg = select(node);
        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        let data = this.createMatrix();

        if (data.x_labels.length === 0 || data.y_labels === 0) return;

        let vis_width = this.state.width - this.margin.left - this.margin.right -10;
        let vis_height = this.state.height - this.margin.top - this.margin.bottom -10;

        // Scales for X-axis
        // TODO how to refactor the following so we can make use of a single scale instead of xScale and xLabel? 
        let xRange = scalePoint()
            .padding(0.5)
            .range([0, vis_width])

        let xScale = xRange.copy()
            .domain(data.x_labels.map((label) => parseInt(label.method_id)));

        let xLabel = xRange.copy()
            .domain(data.x_labels.map((label) => `${label.package_name}.${label.class_name}.${label.method_decl}`));

        // Scales for Y-axis
        // TODO how to refactor the following so we can make use of a single scale instead of yScale and yLabel?
        let yRange = scalePoint()
            .padding(0.5)
            .range([0, vis_height])

        let yScale = yRange.copy()
            .domain(data.y_labels.map((label) => label.test_id));

        let yLabel = yRange.copy()
            .domain(data.y_labels.map((label) => `${label.class_name}.${label.method_name}`));

        if (xLabel.step() !== xScale.step()) {
            // Meaning duplicate class_name.method_name entries
            console.error("xLabel and xScale step are not equal...")
        }


        // Create tick format function, returns a function using the passed parameters.
        function createTickFormatter(labelToggle, labelInterval) {
            return  (label, i) => {
                if (!labelToggle) {
                    label = "";
                }
                return i % labelInterval !== 0 ? " " : label;
            }
        }

        // Create both axis
        let xAxis = axisTop()
            .tickFormat(createTickFormatter(this.labelToggle, 3))
            .scale(xLabel);

        let yAxis = axisLeft()
            .tickFormat(createTickFormatter(this.labelToggle, 3))
            .scale(yLabel);

        const t = transition()
            .duration(750)
            .ease(easeLinear);

        let rectWidth = xLabel.step()
        let rectHeight = yLabel.step()

        select("g.testmatrix")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .selectAll('.cell')
            .data(data.nodes)
            .join(
                enter => enter.append("rect").call(enter => enter
                    .transition(t)
                        .attr("x", (d) => xScale(d.x) - rectWidth/2)
                    .transition(t)
                        .attr("y", (d) => yScale(d.y) - rectHeight/2)
                ),
                update => update.call(update => update
                    .transition(t)
                        .attr("x", (d) => xScale(d.x) - rectWidth / 2)
                    .transition(t)
                        .attr("y", (d) => yScale(d.y) - rectHeight / 2)
                ),
                exit => exit.remove()
                )
                .attr("class", "cell")
                .attr("fill", (d) => d.z)
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("rx", Math.max(1, xScale.step()/2))
                .on('click', onEdgeClick.bind(this));

        let max_font_size = 10;

        function mouseOverHandler(d, i) {
            return select(this)
                .transition()
                .style("font-size", max_font_size + "px")
        }

        function mouseOutHandlerX(d, i) {
            return select(this)
                .transition()
                .style("font-size", "2px")
        }

        function mouseOutHandlerY(d, i) {
            return select(this)
                .transition()
                .style("font-size", "2px")
        }

        function onEdgeClick(e, label) {
            console.log(e, label);
        }

        // Add X and Y axis to the visualization
        select("g.x-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(xAxis)
            .selectAll("text")
                .style("font-size", "2px")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dx", "-2em")
                .attr("transform", "rotate(45)")
                .style("text-anchor", "end")
                .on('mouseover', mouseOverHandler)
                .on('mouseout', mouseOutHandlerX)
                .on('click', this.onMethodClick);

        select("g.y-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(yAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "2px")
                .on('mouseover', mouseOverHandler)
                .on('mouseout', mouseOutHandlerY)
                .on('click', this.onTestClick);
    }

    createTestMatrixView() {
        const node = this.ref.current;

        let svg = select(node);
        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        svg.append("g").attr("class", "x-axis");
        svg.append("g").attr("class", "y-axis");
        svg.append("g").attr("class", "testmatrix");
    }

    render() {
        return (
            <div>
                <svg ref={this.ref} width={this.props.width} height={this.props.height}></svg>
            </div>
        )
    }
}

export default MatrixVisualization;