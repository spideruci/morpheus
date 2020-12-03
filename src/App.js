import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import About from './components/routes/About';
import TestMatrixView from './components/routes/TestMatrixView';
import HistoryMatrixView from './components/routes/HistoryMatrixView';
import Footer from './components/common/Footer';
import Navbar from './components/common/navbar';
import './App.scss';

function App() {
  return (
    <div className='app'>
      
      <Router>
        <Navbar />
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
