const express = require('express');
const router = express.Router();

const weeks = Object.keys(require('../utils/io.samples.json'));
const titles = require('../utils/titles.json');
const gcc = require('../utils/gcc');

const moment = require('moment');

const milliseconds = 24 * 60 * 60 * 1000;

router.get('/', async function(req, res) {

	const { week, admin } = req.query;

	const currentWeek = Math.floor((moment() - moment('2018-09-07 11:00')) / milliseconds / 7) + 1;

	if (week === undefined || isNaN(week)) {
		return res.redirect(`?week=${currentWeek}`);
	}

	if (week > currentWeek && !admin) {
		const startsAt = moment(moment('2018/09/07') + (parseInt(week) - 1) * milliseconds * 7).format('YYYY-MM-DD');
		res.render('coming_soon', { week, startsAt });
	} else if (weeks.includes(week)) {
		res.render('index', {
			week,
			weeks,
			gcc,
			title: titles[week]
		});
	} else {
		res.redirect(`?week=${weeks[weeks.length-1]}`);
	}
});

module.exports = router;
