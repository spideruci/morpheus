import React, { Component } from 'react'
import './App.css'
import { json } from 'd3'
import TestMatrixView from './views/TestMatrixView';


class App extends Component {
  constructor(props){
    super(props);

    this.testMatrixRef = React.createRef();

    this.state = {
      project: "",
      commit: "",
      prod_methods: [],
      test_methods: [],
      links : [],
      width: 750,
      height: 750,
    }

    this.sortData = this.sortData.bind(this)
  }

  componentDidMount() {
    // json(`${process.env.PUBLIC_URL}/data/commons-io/2ae025fe5c4a7d2046c53072b0898e37a079fe62-combined.json`)
    // json(`${process.env.PUBLIC_URL}/data/tarantula/b589f83a9c6bb3631e8c796848c309c2a677b2a8-combined.json`)
    json('http://localhost:8000/coverage/commons-io/6efbccc88318d15c0f5fdcfa0b87e3dc980dca22')
      .then((response) => {
        console.log(response)
        console.log(response.commit_sha);
        this.setState({
          project: response.project,
          commit_sha: response.commit_sha,
          prod_methods: response.coverage.methods,
          test_methods: response.coverage.tests,
          links: response.coverage.links,
        })
      })
      .catch((e) => {
        console.log(e);
      });
  }

  sortData() {
    let sortByName = (a, b) => {
      if (a.packageName < b.packageName) {
        return true;
      }
      if (a.packageName === b.packageName) {
        if (a.className < b.className) {
          return true;
        }
        if (a.className === b.className) {
          if (a.methodName < b.methodName) {
            return true;
          }
        }
      }
      return false;
    };

    let sortTests = (a, b) => {
      if (a.class_name > b.class_name) {
        return true;
      }
      if (a.class_name === b.class_name) {
        if (a.method_name > b.method_name) {
          return true;
        }
      }
      return false;
    };
    console.log("Test methods:", this.state.test_methods);
    return () => {this.setState({
      prod_methods: this.state.prod_methods.sort(sortByName),
      test_methods: this.state.test_methods.sort(sortTests)
    })}
  }

  render() {
    return (
      <div className='App'>
        <h1>{this.state.project}</h1>
        <h4 color="grey">{this.state.commit_sha}</h4>
        <div>
          <TestMatrixView ref={this.testMatrixRef} prod_methods={this.state.prod_methods} test_methods={this.state.test_methods} links={this.state.links} size={[this.state.width, this.state.height]} />
        </div>
      </div>
    )
  }
}

export default App