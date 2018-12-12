const express = require('express');
const router = express.Router();

const gcc = require('../utils/gcc');

const jwt = require('jsonwebtoken');

router.get('/', async function(req, res) {

	res.redirect('/q/1');
});

router.get('/q/:qid', async (req, res) => {

	if (Date.now() < new Date('2018-12-14 18:00')) {
		return res.render('error');
	}

	if (Date.now() >= new Date('2018-12-14 20:00')) {
		return res.render('error');
	}

	const { qid } = req.params;
	if (!qid) return res.redirect('/q/1');

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

	res.render('index', { gcc, qid, studentNumber: decoded.studentNumber })
});

module.exports = router;