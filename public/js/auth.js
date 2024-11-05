/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
import { backend } from './config';

export const login = async (body) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${backend}/users/login`,
      data: body,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully.');
      window.setTimeout(() => location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${backend}/users/logout`,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully.');
      window.setTimeout(() => location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateData = async (body, type) => {
  try {
    const url = { password: 'updatePassword', data: 'updateMe' };

    const res = await axios({
      method: 'PATCH',
      url: `${backend}/users/${url[type.toLowerCase()]}`,
      data: body,
    });

    if (res.data.status === 'success')
      showAlert('success', `${type} updated successfully`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
