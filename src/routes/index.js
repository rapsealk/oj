const express = require('express');
const router = express.Router();

const moment = require('moment');

router.get('/', async function(req, res) {

	const { week } = req.query;
	if (week === undefined || isNaN(week)) return res.redirect('?week=10');

	res.render('index', { update: moment(process.env.BOOT_TIME).format('YYYY-MM-DD HH:mm') });
});

module.exports = router;