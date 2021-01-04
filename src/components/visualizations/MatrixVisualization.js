import React, { Component } from 'react';
import { axisTop, axisLeft } from 'd3-axis';
import { scalePoint, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { schemeSet3 } from 'd3-scale-chromatic';
import { isEqual } from 'lodash';

class MatrixVisualization extends Component {
    constructor(props) {
        super();

        this.ref = React.createRef();

        // TODO remove history from here (state in general should be removed.)
        // Currently used for width/height... 
        this.state = {
            width: 0,
            height: 0,
            xlabel: props.xlabel,
            ylabel: props.ylabel,
        }

        this.margin = {
            top: 50,
            left: 50,
            right: 0,
            bottom: 0
        }

        this.labelToggle = props.hasOwnProperty('labelToggle') ? props['labelToggle'] : false;

        this.createMatrix = this.createMatrix.bind(this);
        this.createTestMatrixView = this.createTestMatrixView.bind(this);
        this.update = this.update.bind(this);

        // Set all methods passed through properties here (we don't use bind because we want to make use of the parent this object.)
        this.onMethodClick = props.onMethodClick;
        this.onTestClick = props.onTestClick;
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
            edges: this.props.edges,
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
            if (!(edge.get_y() === null || edge.get_x() === null)){
                const highlight = edge.hasOwnProperty('highlight') ? edge.highlight : false;

                edges.push({ 
                    x: parseInt(edge.get_x()),
                    y: parseInt(edge.get_y()),
                    z: edge.get_color(),
                    highlight: highlight});
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        let dimensions = this.updateDimensions()

        if (this.state.width !== dimensions.width || this.state.height !== dimensions.height){
            this.setState({
                width: dimensions.width,
                height: dimensions.height,
            }, this.update)
        }
        else if ((!isEqual(prevProps.x, this.props.x)) || (!isEqual(prevProps.y, this.props.y)) ) {
            this.labelToggle = this.props.labelToggle;
            this.onMethodClick = this.props.onMethodClick;
            this.onTestClick = this.props.onTestClick;
            this.update()
        }
    }

    update () {
        // Update viewBox to the state width and height
        const node = this.ref.current;
        let svg = select(node);
        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        let data = this.createMatrix();

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
            .domain(data.x_labels.map((label) => label.to_string()));

        // Scales for Y-axis
        // TODO how to refactor the following so we can make use of a single scale instead of yScale and yLabel?
        let yRange = scalePoint()
            .padding(0.5)
            .range([0, vis_height])

        let yScale = yRange.copy()
            .domain(data.y_labels.map((label) => label.test_id));

        let yLabel = yRange.copy()
            .domain(data.y_labels.map((label) => label.to_string()));

        if (xLabel.step() !== xScale.step()) {
            // Meaning duplicate class_name.method_name entries
            console.error("xLabel and xScale step are not equal...")
        }

        // Create tick format function, returns a function using the passed parameters.
        function createTickFormatter(labelToggle, labelInterval) {
            return  (label, i) => {
                label = "";  
                if (!labelToggle) {
                    label = "";   
                }

                return i % labelInterval !== 0 ? " " : label;
            }
        }

        // Create both axis
        const max_labels = 20;
        const x_tick_interval = data.x_labels.length <= max_labels ? 1 : data.x_labels.length / max_labels;
        const y_tick_interval = data.y_labels.length <= max_labels ? 1 : data.x_labels.length / max_labels;

        const x_toggle = data.x_labels.length <= max_labels && this.labelToggle;
        const y_toggle = data.y_labels.length <= max_labels && this.labelToggle;

        let xAxis = axisTop()
            .tickFormat(createTickFormatter(x_toggle, x_tick_interval))
            .scale(xLabel);

        let yAxis = axisLeft()
            .tickFormat(createTickFormatter(y_toggle, y_tick_interval))
            .scale(yLabel);

        const t = transition()
            .duration(0)
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
                .attr("stroke", (d) => d.highlight ? 'black' : null)
                .attr("stoke-width", (d) => d.highlight ? '1px' : '0px')
                // TODO add tooltip when hovering over a edge

        // Tooltip
        let tooltip = svg.select(".tooltip")
            .style("visibility", 'hidden')

        tooltip.append("text")
            .attr("id", "tooltip-text")
            .style("font-size", "12px")

        // Add X and Y axis to the visualization
        select("g.x-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(xAxis);

        const colorX = (d) => {
            const scale = scaleOrdinal(schemeSet3).domain(Array.from(new Set(data.x_labels.map((d) => d.get_color()))));
            return scale(d);
        }

        // Add circler around ticks
        select("g.x-axis")
            .selectAll('.axis-dots-x')
            .data(data.x_labels)
            .join(
                enter => enter.append('circle').call(enter => enter
                    .attr('cx', (d) => xLabel(d.to_string()) + "px")
                ),
                update => update.call(update => update
                    .attr('cx', (d) => xLabel(d.to_string()) + "px")
                ),
                exit => exit.remove()
            )
                .attr("class", "axis-dots-x")
                .attr('cy', -10)
                .attr('r', 5)
                .style('stroke', 'black')
                .style('stroke-width', '1')
                .style('fill', (d) => colorX(d.get_color()))
                .on('mouseover', (event, d) => {
                    let text_width = 0; 
                    tooltip
                        .style("visibility", "visible")
                        .select("#tooltip-text")
                        .text(d.to_string())
                            .attr("y", event.layerY - (this.margin.top / 4) + "px")
                            .each((d, i) => {
                                text_width = select("#tooltip-text").node().getComputedTextLength();
                            })
                            .attr("transform", "")
                            .attr("x", () => {
                                let x_location = event.layerX - (text_width / 2) + 10;
                                if (x_location < 10){
                                    x_location = 10;
                                }
                                return x_location + "px";
                            })
                })
                .on('mouseout', (event, d) => {
                    tooltip
                        .style("visibility", "hidden");
                })
                .on('click', this.onMethodClick);
        select("g.y-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(yAxis);

        const colorY = (d) => {
            const scale = scaleOrdinal(schemeSet3).domain(Array.from(new Set(data.y_labels.map((d) => d.get_color()))));
            return scale(d);
        }

        select("g.y-axis")
            .selectAll('.axis-dots-y')
            .data(data.y_labels)
            .join(
                    enter => enter.append('circle').call(enter => enter
                        .attr('cy', (d) =>  yLabel(d.to_string()) +  "px")
                    ),
                    update => update.call(update => update
                        .attr('cy', (d) => yLabel(d.to_string()) + "px")
                    ),
                    exit => exit.remove()
                )
                .attr("class", "axis-dots-y")
                .attr('cx', -10)
                .attr('r', 5)
                .style('stroke', 'black')
                .style('stroke-width', '1')
                .style('fill', (d) => colorY(d.get_color()))
                .on('mouseover', (event, d) => {
                    let translateY = yLabel(d.to_string());
                    let translateX = this.margin.left/2
                    let text_width = 0;
                    tooltip
                        .style("visibility", "visible")
                        .select("#tooltip-text")
                            .each((d, i) => {
                                text_width = select("#tooltip-text").node().getComputedTextLength();
                            })
                            .text(d.to_string())
                            .attr("x", 0)
                            .attr("y", 0)
                        .attr("transform", (d) => {
                            translateY = translateY + this.margin.top + text_width / 2;
                            return `translate(${translateX}, ${translateY})rotate(-90)`;
                        });
                })
                .on('mouseout', (event, d) => {
                    tooltip
                        .style("visibility", "hidden");
                })
                .on('click', this.onTestClick);

        // text label for the x axis
        svg.select(".xlabel")
            .attr("x", this.state.width / 2)
            .attr("y", 11)
            .style("text-anchor", "middle")
            .text(this.state.xlabel);

        // text label for the y axis
        svg.select(".ylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", 1)
            .attr("x", -this.state.height / 2)
            .attr("dy", "0.7em")
            .style("text-anchor", "middle")
            .text(this.state.ylabel);
    }

    createTestMatrixView() {
        const node = this.ref.current;

        let svg = select(node);
        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        svg.append("g").attr("class", "x-axis");
        svg.append("g").attr("class", "y-axis");
        svg.append("g").attr("class", "testmatrix");
        svg.append("g").attr("class", "tooltip");

        // Create empty labels, they are updated within the update function.
        svg.append("text").attr("class", "xlabel");
        svg.append("text").attr("class", "ylabel");
    }

    render() {
        return (
            <div id='visualization'>
                <svg ref={this.ref} width={this.props.width} height={this.props.height}></svg>
            </div>
        )
    }
}

export default MatrixVisualization;