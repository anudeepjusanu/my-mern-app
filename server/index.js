/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint consistent-return:0 */

const express = require('express');
const logger = require('./util//logger');
const compression = require('compression');

const argv = require('./util/argv');
const port = require('./util//port');
const setup = require('./middlewares/frontendMiddleware');
const path = require('path');
const Logger = require('tracer').dailyfile({ root: '.logs/', maxLogFiles: 10, allLogsFileName: 'CCB3Logs' });
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// This code will add cache expire header for 1 day
app.get('/*', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=2592000');
  res.setHeader('Expires', new Date(Date.now() + 85000000).toUTCString());
  next();
});

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
}
app.use(compression({
  level: 2, // set compression level from 1 to 9 (6 by default)
  filter: shouldCompress, // set predicate to determine whether to compress
}));

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: path.resolve(process.cwd(), 'build'),
  publicPath: '/app',
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

app.get('/heartBeat', (req, res) => {
  res.send('OK');
});

app.post('/logs', (req, res, next) => {
  Logger.info(`Type ${ req.body.type}`);
  Logger.info(`Data ${ JSON.stringify(req.body.logs)}`);
  res.send('OK');
});

app.get('/', (req, res) => {
  fs.readFile('./home.html', (err, file) => {
    if (err) {
      res.sendStatus(404);
    } else {
      res.send(file.toString());
    }
  });
});


// Start your app.
app.listen(port, host, (err) => {
  if (err) {
    return logger.error(err.message);
  }
  logger.appStarted(port, prettyHost);
});
