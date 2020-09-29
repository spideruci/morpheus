import React, { Component } from 'react';
import { axisTop, axisLeft } from 'd3-axis';
import { scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';


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
        this.update = this.update.bind(this);
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
        this.setState({
            prod_methods: props.prod_methods,
            test_methods: props.test_methods,
            links: props.links,
            width: props.size[0],
            height: props.size[1],
            margin: props.margin,
        }, this.update);
    }

    update () {
        let data = this.createMatrix();

        if (data.x_labels.length === 0 || data.y_labels === 0) return;

        let vis_width = this.state.width - this.state.margin.left - this.state.margin.right;
        let vis_height = this.state.height - this.state.margin.top - this.state.margin.bottom;

        // Scales for X-axis
        let xRange = scalePoint()
            .padding(0.5)
            .range([0, vis_width])

        let xScale = xRange.copy()
            .domain(data.x_labels.map((label) => label.method_id)),

            xLabel = xRange.copy()
            .domain(data.x_labels.map((label) => label.method_name));

        // Scales for Y-axis
        let yRange = scalePoint()
            .padding(0.5)
            .range([0, vis_height])

        let yScale = yRange.copy()
            .domain(data.y_labels.map((label) => label.test_id));

        let yLabel = yRange.copy()
            .domain(data.y_labels.map((label) => label.method_name));

        // Create both axis
        let xAxis = axisTop().tickFormat((interval, i) => {
                return i % 3 !== 0 ? " " : interval;
            })
            .scale(xLabel);

        let yAxis = axisLeft()
            // TODO do we want to filter ticks?
            .tickFormat((interval, i) => {
                return i % 3 !== 0 ? " " : interval;
            })
            .scale(yLabel);

        const t = transition()
            .duration(1500)
            .ease(easeLinear);

        let rectWidth = xScale.step()
        let rectHeight = yScale.step()

        select("g.testmatrix")
            .attr("transform", `translate(${this.state.margin.left}, ${this.state.margin.top})`)
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
                    // .transition()
                    // .duration(t)
                    // .style('opacity', 0)
                    // .on('end', () => d3.select(this).remove())
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
                .style("font-size", Math.max(2, xScale.step()) + "px")
        }

        function mouseOutHandlerY(d, i) {
            return select(this)
                .transition()
                .style("font-size", Math.max(2, yScale.step()) + "px")
        }

        // Add X and Y axis to the visualization
        select("g.x-axis")
            .attr("transform", `translate(${this.state.margin.left}, ${this.state.margin.top})`)
            .call(xAxis)
            .selectAll("text")
                .style("font-size", Math.max(4, xScale.step()) + "px")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dx", "-2em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "end")
                .on('mouseover', mouseOverHandler)
                .on('mouseout', mouseOutHandlerX);

        select("g.y-axis")
            .attr("transform", `translate(${this.state.margin.left}, ${this.state.margin.top})`)
            .call(yAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", Math.max(3, yScale.step()) + "px")
                .on('mouseover', mouseOverHandler)
                .on('mouseout', mouseOutHandlerY);
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