// Catch error function:
module.exports = (func) => (req, res, next) => func(req, res, next).catch(next);
