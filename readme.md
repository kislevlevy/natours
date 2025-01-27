# Natours Project

## Project Overview

Natours is an advanced and feature-rich application for booking and managing tours across the U.S., developed using **Node.js**, **Express**, and **MongoDB**. The application provides a seamless experience for users to explore, book, and manage tours.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control.
- **API with CRUD Functionality**: Fully RESTful API for tour management with advanced features like filtering, sorting, and pagination.
- **Payment Integration**: Accepts Stripe payments.
- **Data Management**: Geospatial queries, data modeling with Mongoose, and NoSQL database management.
- **Security**: Built-in encryption, data sanitization, and rate limiting for optimal security.
- **Deployment**: Deployed on Render with Git version control.

## Technologies and Tools

- **Node.js** and **Express** for the server and API
- **MongoDB** and **Mongoose** for data modeling
- **Stripe** for payment processing
- **Pug** for server-side rendering
- **Render** for production deployment

## Skills Demonstrated

- **API Design**: Creating a RESTful API with advanced features.
- **Authentication and Authorization**: Implementing secure JWT-based authentication and role-based access control.
- **Payment Processing**: Integrating Stripe for handling payments.
- **Data Modeling**: Using Mongoose for data modeling and managing a NoSQL database.
- **Security Best Practices**: Implementing data sanitization, encryption, and rate limiting.
- **Deployment**: Deploying the application on Render with Git version control.

## Installation

To run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/kislevlevy/natours
   ```
2. Navigate to the project directory:
   ```bash
   cd natours
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables as shown in `config.env.md`.
5. Run the app:
   ```bash
   npm run start:dev
   ```
> You can also preview the application by visiting the following link: [Natours Live](https://natours.kislev.me/)

## Usage

- **Explore Tours**: Browse through the available tours and view detailed information about each tour.
- **Book Tours**: Securely book tours using Stripe payment integration.
- **Manage Bookings**: View and manage your bookings through your account.

