import React from 'react';
import { logout } from '../utilities/auth';

const Logout = () => {
  logout();
  return (
    <div />
  );
}

export default Logout;
