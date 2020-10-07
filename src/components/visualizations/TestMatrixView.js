import React, { Component } from 'react';
import { axisTop, axisLeft } from 'd3-axis';
import { scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';


class TestMatrixView extends Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        this.state = {
            prod_methods: this.props.prod_methods,
            test_methods: this.props.test_methods,
            links: this.props.links,
        }

        this.margin = {
            top: 100,
            left: 150,
            right: 0,
            bottom: 0
        }

        this.createMatrix = this.createMatrix.bind(this);
        this.createTestMatrixView = this.createTestMatrixView.bind(this);
        this.update = this.update.bind(this);
    }

    updateDimensions() {
        let visualizationDiv = document.getElementById("visualization");
        return {
            width: visualizationDiv.offsetWidth,
            height: visualizationDiv.offsetHeight,
        }
    }

    createMatrix() {
        if (this.state.prod_methods.length === 0 || this.state.test_methods.length === 0) {
            return {
                x_labels: [],
                y_labels: [],
                nodes: []
            };
        }

        let nodes = []
        let prod_methods = this.state.prod_methods
        let test_methods = this.state.test_methods

        let edges = this.state.links

        // TODO set color based on something and if undefined set to black (#000)
        edges.forEach((edge, index) => {
            let test = test_methods.find(test => test.test_id === edge.test_id)
            let color = test.test_result === 0 ? "#11AA11" : "#FF0000";
            nodes.push({ x: edge["method_id"], y: edge["test_id"], z: color});
        });

        return {
            x_labels: prod_methods,
            y_labels: test_methods,
            nodes: nodes
        };
    }

    componentDidMount() {
        this.createTestMatrixView();
    }

    componentWillReceiveProps(props) {
        let dimensions = this.updateDimensions();

        let newState = {
            prod_methods: props.prod_methods,
            test_methods: props.test_methods,
            links: props.links,
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
        let xRange = scalePoint()
            .padding(0.5)
            .range([0, vis_width])

        let xScale = xRange.copy()
                .domain(data.x_labels.map((label) => label.method_id));

        let xLabel = xRange.copy()
            .domain(data.x_labels.map((label) => `${label.class_name}.${label.method_decl}`));

        // Scales for Y-axis
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

        // Create both axis
        let xAxis = axisTop()
            // .tickFormat((interval, i) => {
            //     return i % 3 !== 0 ? " " : interval;
            // })
            .scale(xLabel);

        let yAxis = axisLeft()
            // .tickFormat((interval, i) => {
            //     return i % 5 !== 0 ? " " : interval;
            // })
            .scale(yLabel);

        const t = transition()
            .duration(1500)
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

        // Event Handlers
        function onMethodClick(e, label) {
            let methods = this.state.prod_methods;
            let test_cases = this.state.test_methods;
            let edges = this.state.links;

            const filter_method = methods.find( m => label === `${m.class_name}.${m.method_decl}`);

            const test_ids = edges.filter(edge => filter_method.method_id === edge.method_id )
                                    .map(edge => edge.test_id);

            const filtered_tests = test_cases.filter( test => test_ids.includes(test.test_id))

            const filtered_edges = edges.filter(
                edge => test_ids.includes(edge.test_id) || edge.method_id === filter_method.method_id )

            const method_ids = filtered_edges.map(edge => edge.method_id)

            const filtered_methods = methods.filter(method => method_ids.includes(method.method_id));


            this.setState({
                prod_methods: filtered_methods,
                test_methods: filtered_tests,
                links: filtered_edges
            }, this.update)
        }

        function onTestClick(e, label) {
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
                .on('click', onMethodClick.bind(this));

        select("g.y-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(yAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "2px")
                .on('mouseover', mouseOverHandler)
                .on('mouseout', mouseOutHandlerY)
                .on('click', onTestClick.bind(this));
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
            <svg ref={this.ref} width={this.state.width} height={this.state.height}></svg>
        )
    }
}

export default TestMatrixView;