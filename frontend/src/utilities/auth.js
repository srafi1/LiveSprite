import Cookies from 'js-cookie';
import axios from 'axios';

export const getUserId = () => Cookies.get('user_id')
export const isAuthenticated = () => !!getUserId()

export const redirectToLogin = () => {
  window.location = '/login';
}

export const login = async (username, password) => {
  // axios call for login, sets tokens as cookies, returns object {success:bool, warning:"invalid login"}
  return await axios.get('/api/login', {params:{username:username, password:password}})
    .then(res => res.data)
    .then(res => {
      if (res.success && !isAuthenticated()) {
        Cookies.set('user_id', res.uid);
      }
      return res;
    });
}

export const register = async (username, password, confirmPassword) => {
  // axios call for register, sets tokens if success, returns object {success:bool, warning:"username is taken, passwords do not match, etc."}
  return await axios.get('/api/register', {params:{username:username, password:password, confirmPassword:confirmPassword}})
    .then(res => res.data)
    .then(res => {
      if (res.success && !isAuthenticated()) {
        Cookies.set('user_id', res.uid);
      }
      return res;
    });
}

export const logout = () => {
  Cookies.remove('user_id');
  redirectToLogin();
}
