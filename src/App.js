import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';

import Footer from './components/Footer';
import Navbar from './components/Navbar';

import About from './pages/About';
import Morpheus from './pages/Morpheus';
import { MorpheusProvider } from './pages/MorpheusContext';

import './styles/global.scss';

function App() {
  return (
    <div className='app'>
      
      <Router>
        <Navbar />
        <div className="component">
          <MorpheusProvider>
            <Switch>
              <Route exact path="/" component={About} />
              <Route exact path="/about" component={About} />
              <Route exact path="/morpheus" component={Morpheus} />
            </Switch>
          </MorpheusProvider>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
