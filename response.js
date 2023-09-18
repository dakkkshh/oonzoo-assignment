const { validationResult } = require('express-validator');
var log = require('./logs');

function success(res, result = 'OK', status = 200) {
	res.status(status).json({ status: status, success: true, response: result });
}


function error(res, error = 'Some internal server error occurred', status = 500) {
	res.status(status).json({ status: status, success: false, response: error });
}

function checkError(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		log.debug(errors);
		return error(res, errors.array()[0].msg || 'invalid parameters', 422);
	}
	next();
}

function isAuthenticated(req, res, next) {
	console.log(req.user);
	if (!req.user) {
		res.clearCookie("jwt");
		return error(res, 'Unauthorized', 401);
	}
	next();
}

module.exports = { success, error, checkError, isAuthenticated};