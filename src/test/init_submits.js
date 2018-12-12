const fs = require('fs');
const path = require('path');
const students = require('../utils/students.json');

const __submits = path.join(__dirname, '../submits');

console.log('__submits:', __submits);

const directoryInitializer = studentNumber => {
    const dirname = path.join(__submits, `${studentNumber}`);
    try {
        fs.statSync(dirname);
    } catch (e) {
        if (e.code === 'ENOENT') fs.mkdirSync(dirname);
    }
};

Object.keys(students).forEach(directoryInitializer);