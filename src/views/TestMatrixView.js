import React, { Component } from 'react';
import * as d3 from 'd3';
import { axisTop, axisLeft } from 'd3';


class TestMatrixView extends Component {
    constructor(props) {
        super(props);
        console.log("props: ", props);
        this.state =
        {
            prod_methods: this.props.prod_methods,
            test_methods: this.props.test_methods,
            links: this.props.links,
            width: this.props.size[0],
            height: this.props.size[1],
            margin: this.props.margin,
        }

        this.ref = React.createRef();

        this.createMatrix = this.createMatrix.bind(this);
        this.createTestMatrixView = this.createTestMatrixView.bind(this);
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
            nodes.push({ x: edge["method_id"], y: edge["test_id"], z: "#000" });
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
        this.setState({
            prod_methods: props.prod_methods,
            test_methods: props.test_methods,
            links: props.links,
            width: props.size[0],
            height: props.size[1],
            margin: props.margin,
        }, this.createTestMatrixView);
    }

    createTestMatrixView() {
        const node = this.ref.current;
        let data = this.createMatrix();

        if (data.x_labels.length === 0 || data.y_labels === 0) return;

        let vis_width = this.state.width - this.state.margin.left - this.state.margin.right;
        let vis_height = this.state.height - this.state.margin.top - this.state.margin.bottom;

        let xScale = d3.scalePoint()
            .domain(data.x_labels.map((label) => label.method_id))
            .range([0, vis_width]);

        let yScale = d3.scalePoint()
            .domain(data.y_labels.map((label) => label.test_id))
            .range([0, vis_height]);

        let xLabel = d3.scalePoint()
            .domain(data.x_labels.map((label) => label.method_name))
            .range([0, vis_width]);

        let yLabel = d3.scalePoint()
            .domain(data.y_labels.map((label) => label.test_name))
            .range([0, vis_height]);

        // Create both axis
        let xAxis = axisTop().scale(xLabel);

        let yAxis = axisLeft()
            // TODO do we want to filter ticks?
            // .tickFormat((interval, i) => {
            //     return i % 3 !== 0 ? " " : interval;
            // })
            .scale(yLabel);

        let svg = d3.select(node);

        // Create visualization 
        svg.append("g")
            .attr("transform", `translate(${this.state.margin.left}, ${this.state.margin.top})`)
            .selectAll('.cell')
            .data(data.nodes)
            .join("circle")
                .attr("class", "cell")
                .attr("cx", (d) => xScale(d.x))
                .attr("cy", (d) => yScale(d.y))
                .attr("fill", (d) => d.z)
                .attr("r", Math.max(0.5, xScale.step() / 2));

        // Add X and Y axis to the visualization
        svg.append('g')
            .attr("class", "x-axis")
            .attr("transform", `translate(${this.state.margin.left}, ${this.state.margin.top})`)
            .call(xAxis)
            .selectAll("text")
                .style("font-size", Math.max(4, xScale.step()) + "px")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dx", "-2em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "end");

        svg.append('g')
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.state.margin.left}, ${this.state.margin.top})`)
            .call(yAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", Math.max(2, yScale.step()) + "px")
    }

    render() {
        return (
            <svg ref={this.ref} width={this.state.width} height={this.state.height}></svg>
        )
    }
}

export default TestMatrixView;