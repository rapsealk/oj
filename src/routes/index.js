const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');
const __submission = path.join(__dirname, 'submits');

router.get('/', async function(req, res) {

	res.redirect('/problem/1');
});

router.get('/problem/:pid', async (req, res) => {

	const { pid } = req.params;
	if (!pid) return res.redirect('/problem/1');

	/*
	if (Date.now() < new Date('2018-12-14 18:00')) {
		return res.render('error');
	}

	if (Date.now() >= new Date('2018-12-14 20:00')) {
		return res.render('error');
	}
	*/

	const { token } = req.cookies;
	if (token === undefined) {
		return res.redirect('/login');
	}

	try {
		const decoded = jwt.verify(token, req.app.get('jwt-secret'));
		console.log('decoded:', decoded);
		if (!decoded) return res.redirect('/login');
		res.render('index', { pid, studentNumber: decoded.studentNumber });
	}
	catch (error) {
		console.log(error.name);
		if (error.name === 'TokenExpiredError')
			return res.redirect('/login');
	}
});

module.exports = router;