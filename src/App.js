import React from 'react';
import {
  Route,
  Link,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import About from './components/routes/About';
import TestMatrixView from './components/routes/TestMatrixView';
import HistoryMatrixView from './components/routes/HistoryMatrixView';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import './App.scss';

function App() {
  return (
    <div className='app'>
      <Header title="Morpheus"/>
      <Router>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/visualization">Visualization</Link>
          <Link to="/history">History</Link>
        </nav>
        <div className="component">
          <Switch>
            <Route exact path="/" component={About} />
            <Route exact path="/about" component={About} />
            <Route exact path="/visualization" component={TestMatrixView} />
            <Route exact path="/history" component={HistoryMatrixView} />
          </Switch>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
