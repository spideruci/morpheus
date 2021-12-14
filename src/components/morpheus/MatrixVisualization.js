import React, { Component } from 'react';
import { axisTop, axisLeft } from 'd3-axis';
import { scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
// import { isEqual } from 'lodash';
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
        this.onXClick = props.onXClick;
        this.onYClick = props.onYClick;
        this.onRightClick = props.onRightClick;
    }

    createMatrix() {
        const current = {
            x: this.props.coverage.x,
            y: this.props.coverage.y,
            edges: this.props.coverage.edges,
        }

        if (current.x.length === 0 || current.y.length === 0) {
            return {
                x_labels: [],
                y_labels: [],
                nodes: []
            };
        }

        return {
            x_labels: current.x,
            y_labels: current.y,
            nodes: current.edges
        };
    }

    componentDidMount() {
        const width = this.ref.current.parentElement.offsetWidth;
        const height = this.ref.current.parentElement.offsetHeight;
        if (this.state.width !== width || this.state.height !== height) {
            this.setState({
                width: width,
                height: height,
            }, this.update)
        }

        window.addEventListener("resize", () => {
            if (this.ref.current === null) {
                return;
            }
            this.setState({
                width: this.ref.current.parentElement.offsetWidth,
                height: this.ref.current.parentElement.offsetHeight
            }, this.update)
        });

        this.createTestMatrixView();
    }

    // TODO how to update visualization, when only a function changes, e.g., Edge.prototype.getColor.
    componentDidUpdate(prevProps, prevState, snapshot) {
    //     if ((!isEqual(prevProps.coverage.x, this.props.coverage.x)) || (!isEqual(prevProps.coverage.y, this.props.coverage.y)) ) {
    //         this.labelToggle = this.props.labelToggle;
    //         this.onXClick = this.props.onXClick;
    //         this.onYClick = this.props.onYClick;
            this.update()
    //     }
    }

    update () {
        const node = this.ref.current;
        let svg = select(node);

        let data = this.createMatrix();

        // Update viewBox to the state width and height
        // the viewbox for the SVG is essentially it's viewport.
        // pratically, this defines the on-screen dimensions wihtin which
        // the user can pan around the matrix. Note: the actual dimensions
        // of the matrix will be relative to this viewBox and can be bigger/
        // smaller then these dimensions.
        svg.attr("viewBox", [0, 0, this.state.width, this.state.height]);

        // basic D3 incantations to enable zoom in the SVG element.
        let zoomFun = zoom().on('zoom', e => {
            select('svg g').attr('transform', e.transform);
        });

        svg.call(zoomFun);

        // this sets the preliminary position of the SVG: scale at 100%, and set top left corner to 0,0.
        select('svg g').attr('transform', 'translate(0,0) scale(1.0)');

        // compute the dimensions of the matrix itself
        // this can be smaller than the SVG's viewbox.
        var unitSide = 0;
        if (data.x_labels.length >= data.y_labels.length) {
            unitSide = (1.0 * this.state.width) / data.x_labels.length
        }
        else {
            unitSide = (1.0 * this.state.height) / data.y_labels.length
        }

        // To adapt width and height perfectly with the canvas' dimensions
        // just set w and h to state.width and .height respectively.
        // TODO: ideally expose this as a user pref with a checkbox in the GUI.
        let w = data.x_labels.length * unitSide; // this.state.width
        let h = data.y_labels.length * unitSide; // this.state.height

        let vis_width = w - this.margin.left - this.margin.right - 10;
        let vis_height = h - this.margin.top - this.margin.bottom - 10;

        // Scales for X-axis
        let xScale = scalePoint()
            .padding(0.5)
            .range([0, vis_width])
            .domain(data.x_labels.map(label => label.getID()));

        // Scales for Y-axis
        let yScale = scalePoint()
            .padding(0.5)
            .range([0, vis_height])
            .domain(data.y_labels.map(label => label.getID()));

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
                label = datum.toString();
            }
            else {
                label = edgeLabel(datum);
            }

            tooltip.select("text")
                .attr("x", parseFloat(select(this).attr("x")) + 60)
                .attr("y", parseFloat(select(this).attr("y")) + 45)
                .text(label)
        }

        function mouseleave(d) {
            tooltip.select("text").style("opacity", 0);
            select(this).style("stroke", "none");
        }

        function edgeLabel(d) {
            let xLabelObject = data.x_labels.find(e => e.getID() === d.x);

            let xLabel = xLabelObject.toString()

            let yLabelObject = data.y_labels.find(e => e.getID() === d.y);
            let yLabel = yLabelObject.toString()
            
            return `${xLabel} tested by ${yLabel}`;
        }

        // Create both axis
        const max_labels = 20;
        const x_tick_interval = data.x_labels.length <= max_labels ? 1 : data.x_labels.length / max_labels;
        const y_tick_interval = data.y_labels.length <= max_labels ? 1 : data.x_labels.length / max_labels;

        const x_toggle = data.x_labels.length <= max_labels && this.labelToggle;
        const y_toggle = data.y_labels.length <= max_labels && this.labelToggle;

        let xAxis = axisTop()
            .tickFormat(createTickFormatter(x_toggle, x_tick_interval))
            .scale(xScale);

        let yAxis = axisLeft()
            .tickFormat(createTickFormatter(y_toggle, y_tick_interval))
            .scale(yScale);

        const t = transition()
            .duration(0)
            .ease(easeLinear);

        let rectWidth = xScale.step()
        let rectHeight = yScale.step()

        let matrixNodes = select("g.testmatrix")
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                .selectAll('.cell')
                .data(data.nodes)
                .join(
                    enter => enter.append("rect").call(enter => enter
                        .transition(t)
                            .attr("x", (d) => xScale(d.getX()) - rectWidth/2)
                        .transition(t)
                            .attr("y", (d) => yScale(d.getY()) - rectHeight/2)
                    ),
                    update => update.call(update => update
                        .transition(t)
                            .attr("x", (d) => xScale(d.getX()) - rectWidth / 2)
                        .transition(t)
                            .attr("y", (d) => yScale(d.getY()) - rectHeight / 2)
                    ),
                    exit => exit.remove()
                )
                .attr("class", "cell")
                .attr("fill", (d) => d.getColor())
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("rx", Math.max(1, xScale.step()/2))
                .attr("stroke", (d) => d.getProperty('highlight') ? 'black' : null)
                .attr("stoke-width", (d) => d.getProperty('highlight') ? '1px' : '0px')
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

        // Add rectangular ticks

        const defaultTickLength = 5.0;

        let tickWidth = rectWidth - (0.1 * rectWidth);
        
        let xTickLength = (this.props.axis_stats === 'None' || this.props.axis_stats === undefined) ?
        () => defaultTickLength : 
        (d) => {
            const tickId = d.id;
            return data.nodes.filter((e) => e.x === tickId).length
        };

        select("g.x-axis")
            .selectAll('.axis-dots-x')
            .data(data.x_labels)
            .join(
                enter => enter.append('rect').call(enter => enter
                    .attr('x', d => `${xScale(d.getID()) - (tickWidth/2)}px`)
                ),
                update => update.call(update => update
                    .attr('x', (d) => `${xScale(d.getID()) - (tickWidth/2)}px`)
                ),
                exit => exit.remove()
            )
            .attr("class", "axis-dots-x")
            .attr('y', (d) => -(xTickLength(d)))
            .attr('height', xTickLength)
            .attr('width', tickWidth)
            .style('stroke', 'black')
            .style('stroke-width', '0.0')
            .style('fill', (d) => d.getColor())
            .on('click', this.onXClick)
            .on('contextmenu', this.onRightClick)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
        
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

        let tickHeight = rectHeight - (0.1 * rectHeight);

        let yTickLength = (this.props.axis_stats === 'None' || this.props.axis_stats === undefined) ?
        () => defaultTickLength :
        (d) => {
            const tickId = d.id;
            return data.nodes.filter((e) => e.y === tickId).length
        };

        select("g.y-axis")
            .selectAll('.axis-dots-y')
            .data(data.y_labels)
            .join(
                enter => enter.append('rect').call(enter => enter
                    .attr('y', d => {
                        return `${yScale(d.getID()) - (tickHeight/2)}px`
                    })
                ),
                update => update.call(update => update
                    .attr('y', (d) => `${yScale(d.getID()) - (tickHeight/2)}px`)
                ),
                exit => exit.remove()
            )
            .attr("class", "axis-dots-y")
            .attr('x', (d) => -(yTickLength(d)))
            .attr('width', yTickLength)
            .attr('height', tickHeight)
            .style('stroke', 'black')
            .style('stroke-width', '0')
            .style('fill', (d) => d.getColor())
            .on('click', this.onYClick)
            .on('contextmenu', this.onRightClick)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // text label for the x axis
        svg.select(".xlabel")
            .attr("x", this.state.width / 2)
            .attr("y", 11)
            .style("text-anchor", "middle")
            .text(this.props.xLabel);

        // text label for the y axis
        svg.select(".ylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", 1)
            .attr("x", -this.state.height / 2)
            .attr("dy", "0.7em")
            .style("text-anchor", "middle")
            .text(this.props.yLabel);
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
            <div style={{width: '100%', height:'100%'}}>
                <svg ref={this.ref}></svg>
            </div>
        )
    }
}

export default MatrixVisualization;