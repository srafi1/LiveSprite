import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { authenticate, isAuthenticated } from '../utilities/auth'

class AuthenticateBeforeRender extends Component {
  state = {
    isAuthenticated: false,
  }

  componentDidMount() {
    authenticate().then(isAuthenticated => {
      this.setState({ isAuthenticated })
    })
  }

  render() {
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
