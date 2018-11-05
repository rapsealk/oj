const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {

	res.render('index', { account: "account", amount: 0 });
});

module.exports = router;