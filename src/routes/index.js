const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

//const database = require('../utils/database');

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

		const { studentNumber } = decoded;
		const history = { "1": false, "2": false, "3": false, "4": false, "5": false };

		/*
		try {
			var conn = await database.getConnection();
			const query = 'SELECT * FROM record WHERE studentNumber = ?';
			const records = await conn.query(query, [studentNumber]);
			records.forEach(record => history[record.pid] = !!record.result);
		}
		catch (error) {
			console.error(error);
		}
		finally {
			await database.releaseConnection(conn);
		}
		*/

		res.render('index', { pid, studentNumber, history });
	}
	catch (error) {
		console.log(error.name);
		if (error.name === 'TokenExpiredError')
			return res.redirect('/login');
	}
});

module.exports = router;