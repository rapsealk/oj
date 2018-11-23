const express = require('express');
const router = express.Router();

const gcc = require('../utils/gcc');

const jwt = require('jsonwebtoken');

router.get('/', async function(req, res) {

	const { token } = req.cookies;
	if (token === undefined) {
		return res.redirect('/login');
	}

	const decoded = jwt.verify(token, req.app.get('jwt-secret'));
	console.log('decoded:', decoded);
	// expired
	if (!decoded) {
		return res.redirect('/login');
	}

	res.render('index', { gcc, studentNumber: decoded.studentNumber });
});

module.exports = router;
