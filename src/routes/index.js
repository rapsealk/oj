const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const filelist = fs.readdirSync(path.join(__dirname, '../views/index'))
					.map(filename => filename.split('.').shift());

const moment = require('moment');

const milliseconds = 24 * 60 * 60 * 1000;

router.get('/', async function(req, res) {

	const { week } = req.query;
	if (week === undefined || isNaN(week)) {
		const currentWeek = Math.floor((moment() - moment('2018/09/07')) / milliseconds / 7) + 1;
		return res.redirect(`?week=${currentWeek}`);
	}

	if (filelist.includes(week)) {
		res.render(`index/${week}`, {
			week: week,
			history: filelist
		});
	} else {
		res.render('error');
	}
});

module.exports = router;