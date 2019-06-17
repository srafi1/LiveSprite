import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { isAuthenticated, redirectToLogin } from '../utilities/auth'

class AuthenticateBeforeRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
    }
  }

  componentDidMount() {
    if (isAuthenticated()) {
      this.setState({isAuthenticated:true})
    } else {
      redirectToLogin();
    }
  }

  render = () => {
    return this.state.isAuthenticated ? this.props.render() : null
  }
}

export const AuthenticatedRoute = ({
  component: Component,
  exact,
  path,
}) => (
  <Route
    exact={exact}
    path={path}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <AuthenticateBeforeRender render={() => <Component {...props} />} />
      )
    }
  />
)
