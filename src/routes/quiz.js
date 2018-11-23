const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.redirect('/quiz/1'));

router.get('/:id', (req, res) => {

    const { id } = req.params;
    console.log('id:', id);

    if (isNaN(id)) {
        return res.redirect('/');
    }

    res.redirect('/');
});

module.exports = router;