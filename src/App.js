import React from 'react';
import {
  Route,
  Link,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import About from './components/routes/About';
import TestMatrixVisualization from './components/routes/TestMatrixVisualization';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import './App.scss';

function App() {
  return (
    <div class='app'>
      <Header />
      <Router>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/visualization">Visualization</Link>
        </nav>
        <Switch>
          <Route exact path="/" component={About} />
          <Route exact path="/about" component={About} />
          <Route exact path="/visualization" component={TestMatrixVisualization} />
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
