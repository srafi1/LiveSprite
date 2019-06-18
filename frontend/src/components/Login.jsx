import React, { Component } from 'react';
import { isAuthenticated, login, register } from '../utilities/auth'

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginErrors: [],
      registerErrors: []
    }
  }

  inputChanged = (e) => {
    let newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  validInput = (s) => {
    return s && s !== '';
  }

  loginHandler = (e) => {
    e.preventDefault();
    if (this.validInput(this.state.usernameL) && this.validInput(this.state.passwordL)) {
      this.setState({loginErrors:[]});
      login(this.state.usernameL, this.state.passwordL)
        .then((res) => {
          if (res.success) {
            window.location = '/profile';
          } else {
            this.setState({loginErrors:[res.warning]});
          }
        });
    } else {
      let errors = [];
      if (!this.validInput(this.state.usernameL)) {
        errors.push('Username is required');
      }
      if (!this.validInput(this.state.passwordL)) {
        errors.push('Password is required');
      }
      this.setState({loginErrors:errors});
    }
  }

  registerHandler = (e) => {
    e.preventDefault();
    if (this.validInput(this.state.usernameR) && 
      this.validInput(this.state.passwordR) &&
      this.validInput(this.state.confirmPasswordR) &&
      this.state.confirmPasswordR === this.state.passwordR) {
      this.setState({registerErrors:[]});
      register(this.state.usernameR, this.state.passwordR, this.state.passwordR)
        .then((res) => {
          if (res.success) {
            window.location = '/profile';
          } else {
            this.setState({registerErrors:[res.warning]});
          }
        });
    } else {
      let errors = [];
      if (!this.validInput(this.state.usernameR)) {
        errors.push('Username is required');
      }
      if (!this.validInput(this.state.passwordR)) {
        errors.push('Password is required');
      }
      if (!this.validInput(this.state.confirmPasswordR)) {
        errors.push('Confirm Password is required');
      }
      if (this.state.confirmPasswordR !== this.state.passwordR) {
        errors.push('Passwords must match');
      }
      this.setState({registerErrors:errors});
    }
  }

  render = () => {
    if (isAuthenticated()) {
      window.location = '/profile';
    }

    return (
      <div className="flex-container">
        <div className="border-right">
          <form onSubmit={this.loginHandler}>
            <table>
              <thead>
                <tr>
                  <td></td>
                  <td>
                    <h1>Login</h1>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td>{ this.state.loginErrors.map((error, i) => <p key={i} className="error">{error}</p>) }</td>
                </tr>
                <tr>
                  <td>Username: </td>
                  <td>
                    <input type="text" name="usernameL" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td>Password: </td>
                  <td>
                    <input type="password" name="passwordL" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <input className="button" type="submit" value="Login" />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
        <div>
          <form onSubmit={this.registerHandler}>
            <table>
              <thead>
                <tr>
                  <td></td>
                  <td>
                    <h1>Register</h1>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td>{ this.state.registerErrors.map((error, i) => <p key={i} className="error">{error}</p>) }</td>
                </tr>
                <tr>
                  <td>Username: </td>
                  <td>
                    <input type="text" name="usernameR" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td>Password: </td>
                  <td>
                    <input type="password" name="passwordR" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td>Confirm Password: </td>
                  <td>
                    <input type="password" name="confirmPasswordR" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <input className="button" type="submit" value="Register" />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
      );
  }
}

export default Login;
