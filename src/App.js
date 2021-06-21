import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import About from './components/routes/About';
import TestMatrixView from './components/routes/TestMatrixView';
import Footer from './components/common/Footer';
import Navbar from './components/common/navbar';
import './App.scss';

function App() {
  return (
    <div className='app'>
      
      <Router basename={process.env.PUBLIC_URL}>
        <Navbar />
        <div className="component">
          <Switch>
            <Route exact path="/" component={TestMatrixView} />
            <Route path="/about" component={About} />
            <Route path="/visualization" component={TestMatrixView} />
          </Switch>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
