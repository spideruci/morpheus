import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {
    constructor(props) {
        super();
        this.state = {
            width: props.size[0],
            height: props.size[1],
        }

        this.ref = React.createRef();
        this.createBarChart = this.createBarChart.bind(this);
    }

    componentDidMount() {
        this.createBarChart();
    }

    componentDidUpdate() {
        this.createBarChart();
    }

    createBarChart() {
        const node = this.ref.current;
        const dataMax = d3.max(this.props.data)
        const yScale = d3.scaleLinear()
            .domain([0, dataMax])
            .range([0, this.props.size[1]]);

        let rect = d3.select(node)
            .selectAll('rect')
            .data(this.props.data);

        rect.enter()
            .append('rect')
                .style('fill', '#fe9922')
                .attr('x', (d, i) => i * 25)
                .attr('y', d => this.props.size[1] - yScale(d))
                .attr('height', d => yScale(d))
                .attr('width', 25);

        rect.exit()
            .remove();
    }

    render() {
        return (
            <svg ref={this.ref} width={this.state.width} height={this.state.height}></svg>
        )
    }
}

export default BarChart;