const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const students = require('../utils/students.json');

router.get('/', (req, res) => {

    const { token } = req.cookies;
    if (token !== undefined && jwt.verify(token, req.app.get('jwt-secret'))) {
        return res.redirect('/');
    }

    const message = '지급된 비밀번호를 입력해주세요.';

	res.render('login', { message });
});

router.post('/', (req, res) => {

    const { studentNumber, password } = req.body;   // ''
    
    if (!studentNumber || !password || students[studentNumber] === undefined || students[studentNumber] !== password) {
        return res.render('login', { message: '학번 혹은 비밀번호가 틀렸습니다.' });
    }

    const payload = { studentNumber };
    const token = jwt.sign(payload, req.app.get('jwt-secret'), { expiresIn: '2h' });

    res.cookie("token", token);

    res.redirect('/');
});

module.exports = router;