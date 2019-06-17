import Cookies from 'js-cookie';
import axios from 'axios';

export const getAccessToken = () => Cookies.get('access_token')
export const getRefreshToken = () => Cookies.get('refresh_token')
export const isAuthenticated = () => !!getAccessToken()

const redirectToLogin = () => {
  window.location = '/login';
}

const refreshTokens = async () => {
  // axios call to server with tokens, returns new tokens
}

export const login = async (username, password) => {
  // axios call for login, sets tokens as cookies, returns object {success:bool, warning:"invalid login"}
  if (username === 's' && password === 'r') {
    return {success: true, warning: ""};
  } else {
    return {success: false, warning: "Invalid login"};
  }
}

export const register = async (username, password, confirmPassword) => {
  // axios call for register, sets tokens if success, returns object {success:bool, warning:"username is taken, passwords do not match, etc."}
  if (username === 's' && password === 'r' && confirmPassword === 'r') {
    return {success: true, warning: ""};
  } else {
    return {success: false, warning: "Invalid registration"};
  }
}

export const authenticate = async () => {
  if (getRefreshToken()) {
    try {
      const tokens = await refreshTokens()

      const expires = (tokens.expires_in || 24 * 60 * 60) * 1000
      const expireTime = new Date(new Date().getTime() + expires)

      Cookies.set('access_token', tokens.access_token, { expires: expireTime })
      Cookies.set('refresh_token', tokens.refresh_token)

      return true
    } catch (error) {
      redirectToLogin()
      return false
    }
  }

  redirectToLogin()
  return false
}
