import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import { Route, Link, BrowserRouter as Router } from 'react-router-dom';
import { AuthenticatedRoute } from './components/AuthenticatedRoute';
import { isAuthenticated } from './utilities/auth';
import Home from './components/Home';
import Login from './components/Login';
import Logout from './components/Logout';
import Profile from './components/Profile';
import NewProject from './components/NewProject';
import Studio from './components/Studio';
import './index.css';

let nav;
if (isAuthenticated()) {
  nav = (
    <nav>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/new">New Project</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/logout">Logout</Link>
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
    <Route path="/logout" component={Logout} />
    <AuthenticatedRoute path="/profile" component={Profile} />
    <AuthenticatedRoute path="/new" component={NewProject} />
    <AuthenticatedRoute path="/studio/:id" component={Studio} />
  </Router>
);

ReactDOM.render(router, document.getElementById('root'));

serviceWorker.unregister();
