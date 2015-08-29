module.exports = [].concat(
  require('./auth').routes,
  require('./tags').routes,
  require('./upload').routes
);