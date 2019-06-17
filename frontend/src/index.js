import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import { Route, Link, BrowserRouter as Router } from 'react-router-dom';
import { AuthenticatedRoute } from './components/AuthenticatedRoute';
import { isAuthenticated } from './utilities/auth';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import './index.css';

let nav;
if (isAuthenticated()) {
  nav = (
    <nav>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
    );
} else {
  nav = (
    <nav>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/login">Login / Register</Link>
      </div>
    </nav>
    );
}

const router = (
  <Router>
    {nav}

    <Route exact path="/" component={Home} />
    <Route path="/login" component={Login} />
    <AuthenticatedRoute path="/profile" component={Profile} />
  </Router>
);

ReactDOM.render(router, document.getElementById('root'));

serviceWorker.unregister();
