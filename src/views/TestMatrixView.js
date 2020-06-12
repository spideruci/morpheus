import React, { Component } from 'react';
import * as d3 from 'd3';


class TestMatrixView extends Component {
    constructor(props) {
        super(props);
        this.state = 
        {
            data: this.props.data,
            width: this.props.size[0],
            height: this.props.size[1],
        }

        this.ref = React.createRef();
        this.createTestMatrixView = this.createTestMatrixView.bind(this);
    }

    componentDidMount() {
        this.createTestMatrixView();
    }

    componentDidUpdate() {
        this.createTestMatrixView();
    }

    componentWillReceiveProps(props) {
        console.log("componentWillReceiveProps", props.data)
        this.setState({
            data: props.data,
            width: props.size[0],
            height: props.size[1],
        }, this.createTestMatrixView);
    }

    createTestMatrixView() {
        const node = this.ref.current;
        console.log("createTestMatrixView" , this.state);
        let data = this.state.data.map(v => Object.keys(v).map(c => Number(v[c]) ? Number(v[c]) : v[c]));
        console.log(data);
        let numColumns;
        let numRows;

        if (data.length === 0) {            
            numRows = 0;
            numColumns = 0;
        } else {
            numRows = data.length;
            numColumns = data[0].length;
        }
        console.log("this.state.width", this.state.width);

        let xScale = d3.scaleBand()
            .domain(d3.range(numColumns))
            .range([0, this.state.width]);

        let yScale = d3.scaleBand()
            .domain(d3.range(numRows))
            .range([0, this.state.height]);


        let svg = d3.select(node);
        
        let rows = svg.selectAll('.row')
            .data(data);
        
        let currentRows = rows.enter()
                .append('g')
                .attr("class", "row")
                .attr("transform", function (d, i) { return "translate(0, " + yScale(i) + ")";});
        
        rows.exit().transition().style("opacity", 0).delay(100).remove();
        
        let cells = currentRows.selectAll(".cell")
            .data(function (d) {return d;});

        cells.enter()
                .select(function (d, i) { return d === 1 ? this: null})
                .append("rect")
                .attr("class", "cell")
                .attr("x", function (d, i) { return xScale(i) })
                .attr("fill", function(d, i) {
                    return d === 1 ? "black" : "white"
                })
                .attr("width", Math.max(1, xScale.bandwidth()))
                .attr("height", Math.max(1, yScale.bandwidth()));
    
        
        cells.exit().remove();
    }

    render() {
        return (
            <svg ref={this.ref} width={this.state.width} height={this.state.height}></svg>
        )
    }
}

export default TestMatrixView;