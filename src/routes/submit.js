const express = require('express');
const router = express.Router();

const fs = require('fs');
const { spawn } = require('child_process');

router.post('/', async (req, res) => {

    const { studentNumber, code } = req.body;
    const dirname = `submits/${studentNumber}`;

    try {
        fs.statSync(dirname);        
    } catch (e) {
        console.log('e:', e);
        if (e.errno === -4058)
            fs.mkdirSync(dirname);
    }

    const filename = `${dirname}/${Date.now()}.c`;
    fs.writeFileSync(filename, code, 'utf-8');

    const compile = spawn('gcc', [`$${filename}`, '-o', `${dirname}/expr`]);
    compile.stdout.on('data', data => console.log('stdout:', data));
    compile.stderr.on('data', data => console.log('stderr:', data));
    compile.on('close', code => console.log('close:', code));

    console.log('code:', code);

    res.json({ result: true });
});

module.exports = router;