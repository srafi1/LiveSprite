import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import { Route, Link, BrowserRouter as Router } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import './index.css';

const router = (
  <Router>
    <nav>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/login">Login / Register</Link>
      </div>
    </nav>

    <Route exact path="/" component={Home} />
    <Route path="/login" component={Login} />
  </Router>
);

ReactDOM.render(router, document.getElementById('root'));

serviceWorker.unregister();
