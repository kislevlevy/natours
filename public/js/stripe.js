/* eslint-disable */

import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { backend, stripePublic } from './config';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // get session from the server:
    const { data } = await axios(`${backend}/bookings/checkout-session/${tourId}`);

    const stripe = await loadStripe(stripePublic);
    await stripe.redirectToCheckout({ sessionId: data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
