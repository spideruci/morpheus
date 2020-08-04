import React, { Component } from 'react'
import './App.css'
import { json } from 'd3'
import TestMatrixView from './views/TestMatrixView';


class App extends Component {
  constructor(props){
    super(props);

    this.testMatrixRef = React.createRef();

    this.state = {
      prod_methods: [],
      test_methods: [],
      width: 750,
      height: 750,
    }

    this.sortData = this.sortData.bind(this)
  }

  componentDidMount() {
    // json(`${process.env.PUBLIC_URL}/data/commons-io/821ab5fc6140581d0dd4906c9cbcb721de0ec1fb-combined.json`)
    // json(`${process.env.PUBLIC_URL}/data/gson/3e74bb47d1a72f72873109e8f0407a34d25fe7e6-combined.json`)
    json(`${process.env.PUBLIC_URL}/data/tarantula/b589f83a9c6bb3631e8c796848c309c2a677b2a8-combined.json`)
    // json(`${process.env.PUBLIC_URL}/data/commons-cli/3f150ee61685fca466b38292144ce79d4755d749-combined.json`)
      .then((coverage) => {
        this.setState({
          prod_methods: coverage.methods.production,
          test_methods: coverage.methods.test,
        })
      });
  }

  sortData(sortFunction) {
    return () => {this.setState({
      prod_methods: this.state.prod_methods.sort(sortFunction),
      test_methods: this.state.test_methods,
    })}
  }

  render() {
    console.log("render")
    let sortByName = (a, b) =>{
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

    return (
      <div className='App'>
        <div>
          <button onClick={this.sortData(sortByName)}>Sort Production by Name</button>
          {/* <button onClick={this.sortData(sortByClassName)}>Sortby className</button> */}
        </div>
        <div>
          <TestMatrixView ref={this.testMatrixRef} prod_methods={this.state.prod_methods} test_methods={this.state.test_methods} size={[this.state.width, this.state.height]} />
        </div>
      </div>
    )
  }
}

export default App