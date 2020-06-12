import React, { Component } from 'react'
import './App.css'
import { csv } from 'd3'
import TestMatrixView from './views/TestMatrixView';

class App extends Component {
  constructor(props){
    super(props);

    this.testMatrixRef = React.createRef();

    this.state = {
      method_coverage: [],
      width: 750,
      height: 750,
    }

    this.filterData = this.filterData.bind(this)
    this.sortData = this.sortData.bind(this)
  }

  componentDidMount() {
    csv(`${process.env.PUBLIC_URL}/data/data.csv`)
      .then((coverage) => {
        console.log(coverage)
        this.setState({ method_coverage: coverage })
      });
    // this.setState({ method_coverage: [[0, 0, 1], [1, 0, 0], [0, 0, 1], [0, 0, 1]] })
  }

  sortData() {
    this.setState({ method_coverage: [[1, 1, 1], [1, 0, 0], [0, 0, 1]] })
  }

  filterData() {
    let newData = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    this.setState({
      method_coverage: newData
    });
  }

  render() {
    console.log("render")
    return (
      <div className='App'>
        <div>
          <button onClick={this.sortData}>Sort</button>
          <button onClick={this.filterData}>Filter</button>
        </div>
        <div>
          <TestMatrixView ref={this.testMatrixRef} data={this.state.method_coverage} size={[this.state.width, this.state.height]} />
        </div>
      </div>
    )
  }
}

export default App