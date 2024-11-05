/* eslint-disable */

// Imports:
import '@babel/polyfill';

import { displayMap } from './mapbox';
import { login, logout, updateData } from './auth';
import { showAlert } from './alerts';
import { bookTour } from './stripe';

// HTML elements:
const loginForm = document.querySelector('.login-form form');
const userDataForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-settings');
const map = document.getElementById('map');
const logoutBtn = document.querySelector('.nav_el--logout');
const bookBtn = document.querySelector('#book-tour');
const alertMsg = document.querySelector('body').dataset.alert;

// Login form:
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login({ email, password });
  });

// Update user data form:
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showAlert('success', 'Updating user data...');

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('profilePhoto', document.getElementById('profilePhoto').files[0]);

    updateData(form, 'Data');
  });

// Update password form:
if (passwordForm)
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAlert('success', 'Updating Password...');

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateData({ passwordCurrent, password, passwordConfirm }, 'Password');

    passwordForm.reset();
  });

// Mapbox:
if (map) displayMap(JSON.parse(document.getElementById('map').dataset.locations));

// Logout button logic:
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// book tour logic:
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    const { tourId } = e.target.dataset;

    e.target.textContent = 'Processing...';
    bookTour(tourId);
  });
}

if (alertMsg) showAlert('success', alertMsg, 20);
