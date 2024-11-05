/* eslint-disable no-console */

// Module Imports:
const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

////////////////////////////////////////////////
// Error handeling (Pre Server):
// Uncaught exception error handling:
process.on('uncaughtException', (err) => {
  console.log({ status: 'error', message: err.message });
  process.exit(1);
});

////////////////////////////////////////////////
// Environment config
dotenv.config({ path: './config.env' });
const app = require('./app');

////////////////////////////////////////////////
// App start:
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port - ${PORT}\nhttp://localhost:${PORT}`);
});

////////////////////////////////////////////////
// Database connect:
(async function () {
  const url = process.env.DB_LINK.replace('<PASS>', process.env.DB_PASS).replace(
    '<USER>',
    process.env.DB_USER,
  );
  await mongoose.connect(url);
})()
  .then(() => console.log('DB connection was successful!'))
  .catch((err) => {
    console.log({ status: 'error', message: err.errmsg });
    server.close(() => process.exit(1));
  });

////////////////////////////////////////////////
// Error handeling (Post Server):
// Unhandled rejection error handling:
process.on('unhandledRejection', (err) => {
  console.log({ status: 'error', message: err.message });
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recived - shutting sown.');
  server.close(() => console.log('All proccess terminated.'));
});
