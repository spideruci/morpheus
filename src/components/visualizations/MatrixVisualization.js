import React, { Component } from 'react';
import { axisTop, axisLeft } from 'd3-axis';
import { scalePoint, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { schemeSet3 } from 'd3-scale-chromatic';
import { isEqual } from 'lodash';
import { zoom } from 'd3-zoom';

class MatrixVisualization extends Component {
    constructor(props) {
        super();

        this.ref = React.createRef();

        this.state = {
            width: 0,
            height: 0,
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
        this.onRightClick = props.onRightClick;
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
        console.log(current);

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
        window.addEventListener("resize", () => {
            setTimeout(500);
            this.setState({
                width: this.ref.current.parentElement.offsetWidth,
                height: this.ref.current.parentElement.offsetHeight
            }, this.update)
        });

        this.createTestMatrixView();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.ref.current !== null) {
            const width = this.ref.current.parentElement.offsetWidth;
            const height = this.ref.current.parentElement.offsetHeight;
            if (this.state.width !== width || this.state.height !== height) {
                console.log("COMPONENT DID UPDATE ")
                this.setState({
                    width: width,
                    height: height,
                }, this.update)
            }
        }
        

        if ((!isEqual(prevProps.x, this.props.x)) || (!isEqual(prevProps.y, this.props.y)) ) {
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

        let data = this.createMatrix();

        let w = data.x_labels.length * 3;
        let h = data.y_labels.length * 3;

        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        let zoom1 = zoom().on('zoom', e => {
            select('svg g').attr('transform', e.transform);
        });

        svg.call(zoom1);

        let vis_width = w - this.margin.left - this.margin.right -10;
        let vis_height = h - this.margin.top - this.margin.bottom -10;

        // Scales for X-axis
        // TODO how to refactor the following so we can make use of a single scale instead of xScale and xLabel? 
        let xRange = scalePoint()
            .padding(0.5)
            .range([0, vis_width])

        let xScale = xRange.copy()
            .domain(data.x_labels.map((label) => parseInt(label.get_id())));

        let xLabel = xRange.copy()
            .domain(data.x_labels.map((label) => label.to_string()));

        // Scales for Y-axis
        // TODO how to refactor the following so we can make use of a single scale instead of yScale and yLabel?
        let yRange = scalePoint()
            .padding(0.5)
            .range([0, vis_height])

        let yScale = yRange.copy()
            .domain(data.y_labels.map((label) => label.get_id()));

        let yLabel = yRange.copy()
            .domain(data.y_labels.map((label) => label.to_string()));

        if (xLabel.step() !== xScale.step()) {
            // Meaning duplicate class_name.method_name entries
            console.error("xLabel and xScale step are not equal...")
        }
        if (yLabel.step() !== yScale.step()) {
            // Meaning duplicate class_name.method_name entries
            console.error("yLabel and yScale step are not equal...")
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

        // Tooltip
        let tooltip = svg.select(".tooltip").style("visibility", 'visible');

        tooltip.append("text")
            .attr("id", "tooltip-text")
            .attr("dominant-baseline", "auto")
            .attr("text-anchor", "start")
            .attr("stroke", "grey")
            .attr("stroke-opacity", "0.3")
            .attr("stroke-width", "5")
            .attr("fill", "black")
            .style("font-size", "12px")
            .style("opacity", 0)
            .html("");
    
        function mouseover(d) {
            tooltip.select("text").style("opacity", 1)
            select(this).style("stroke", "black")
        }

        function mousemove() {
            let self = select(this);
            let datum = self.datum();

            let label = "";
            if (datum.x === undefined) {
                label = `${datum.class_name}.${datum.method_name}`;
            }
            else {
                label = edgeLabel(datum);
            }

            tooltip.select("text")
                .attr("x", parseFloat(select(this).attr("x")) + 60)
                .attr("y", parseFloat(select(this).attr("y")) + 60)
                .html(label)
        }

        function mouseleave(d) {
            tooltip.select("text").style("opacity", 0);
            select(this).style("stroke", "none");
        }

        function edgeLabel(d) {
            let xLabelObject = data.x_labels.find(e => e.method_id === d.x);

            let methodLabel = xLabelObject?.method_name ?? "unknownMethod";
            let classLabel = xLabelObject?.class_name ?? "UnknownClass";

            let yLabelObject = data.y_labels.find(e => e.test_id === d.y);
            let testLabel = yLabelObject?.method_name ?? "unknown test";
            
            return `${classLabel}.${methodLabel} tested by ${testLabel}`;
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

        let matrixNodes = select("g.testmatrix")
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
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);
        
        matrixNodes.selectAll("*").remove();
        matrixNodes.append("title")
                    .text(edgeLabel);



        // Add X and Y axis to the visualization
        select("g.x-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(xAxis)
            .selectAll("line")
            .style("stroke", "white")
            .style("stroke-width", "0.0");
        
        select("g.x-axis")
            .select("path")
            .style("stroke", "grey")
            .style("stroke-width", "0.5");


        const colorX = (d) => {
            const scale = scaleOrdinal(schemeSet3).domain(Array.from(new Set(data.x_labels.map((d) => d.get_color()))));
            return scale(d);
        }

        let tickWdith = rectWidth - (0.1 * rectWidth);

        // Add circler around ticks
        let xTicks = select("g.x-axis")
            .selectAll('.axis-dots-x')
            .data(data.x_labels)
            .join(
                enter => enter.append('rect').call(enter => enter
                    .attr('x', d => {
                        return `${xLabel(d.to_string()) - (tickWdith/2)}px`
                    })
                ),
                update => update.call(update => update
                    .attr('x', (d) => `${xLabel(d.to_string()) - (tickWdith/2)}px`)
                ),
                exit => exit.remove()
            )
            .attr("class", "axis-dots-x")
            .attr('y', -10)
            .attr('height', 10)
            .attr('width', tickWdith)
            .style('stroke', 'black')
            .style('stroke-width', '0.0')
            .style('fill', (d) => colorX(d.get_color()))
            .on('click', this.onMethodClick)
            .on('contextmenu', this.onRightClick)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
        
        xTicks.selectAll("*").remove();
        xTicks.append("title").text(d => `${d.class_name}.${d.method_name}`);
        
        select("g.y-axis")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(yAxis)
            .selectAll("line")
            .style("stroke", "white")
            .style("stroke-width", "0.0");

        select("g.y-axis")
            .select("path")
            .style("stroke", "grey")
            .style("stroke-width", "0.5");

        const colorY = (d) => {
            const scale = scaleOrdinal(schemeSet3).domain(Array.from(new Set(data.y_labels.map((d) => d.get_color()))));
            return scale(d);
        }

        let tickHeight = rectHeight - (0.1 * rectHeight);

        let yTicks = select("g.y-axis")
            .selectAll('.axis-dots-y')
            .data(data.y_labels)
            .join(
                enter => enter.append('rect').call(enter => enter
                    .attr('y', d => {
                        return `${yLabel(d.to_string()) - (tickHeight/2)}px`
                    })
                ),
                update => update.call(update => update
                    .attr('y', (d) => `${yLabel(d.to_string()) - (tickHeight/2)}px`)
                ),
                exit => exit.remove()
            )
            .attr("class", "axis-dots-y")
            .attr('x', -10)
            .attr('width', 10)
            .attr('height', tickHeight)
            .style('stroke', 'black')
            .style('stroke-width', '0')
            .style('fill', (d) => colorY(d.get_color()))
            .on('click', this.onTestClick)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
        
        yTicks.selectAll("*").remove();
        yTicks.append("title")
            .text(d => {
                return `${d.class_name}.${d.method_name}`;
            });

        // text label for the x axis
        svg.select(".xlabel")
            .attr("x", this.state.width / 2)
            .attr("y", 11)
            .style("text-anchor", "middle")
            .text(this.props.xlabel);

        // text label for the y axis
        svg.select(".ylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", 1)
            .attr("x", -this.state.height / 2)
            .attr("dy", "0.7em")
            .style("text-anchor", "middle")
            .text(this.props.ylabel);
    }

    createTestMatrixView() {
        const node = this.ref.current;

        let svg = select(node);
        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        let g = svg.append("g");

        g.append("g").attr("class", "x-axis");
        g.append("g").attr("class", "y-axis");
        g.append("g").attr("class", "testmatrix");
        g.append("g").attr("class", "tooltip");

        // Create empty labels, they are updated within the update function.
        svg.append("text").attr("class", "xlabel");
        svg.append("text").attr("class", "ylabel");
    }

    render() {
        return (
            <div id='visualization'>
                <svg ref={this.ref}></svg>
            </div>
        )
    }
}

export default MatrixVisualization;