const express = require('express');
const router = express.Router();

const iosamples = require('../utils/io.samples.json');

router.get('/', (req, res) => {

    const { week } = req.query;

    if (week === undefined || isNaN(week) || !(week in iosamples)) {
        return res.json({
            data: {
                inputs: ['// Not ready yet.'],
                outputs: ['// Not ready yet.']
            }
        });
    }

    res.json({ data: iosamples[week] });
});

module.exports = router;