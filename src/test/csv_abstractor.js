const fs = require('fs');
const crypto = require('crypto');

const exercise = fs.readFileSync('../students_exercise.csv', { encoding: 'utf-8' });

const lines = exercise.split('\n').slice(2, 68);

const json = {};

const students = lines.map(line => {
    const tokens = line.split(',');
    /*
    return {
        major: tokens[2],
        studentNumber: tokens[4],
        studentName: tokens[5]
    }
    */
   const password = crypto.randomBytes(5).toString('hex');
   json[tokens[4]] = password;
   return `${tokens[2]},${tokens[4]},${tokens[5]},${password}`;
});

/**
 * Write csv file.
 */
const dest = fs.writeFileSync('./password.csv', students.join('\n'), { encoding: 'utf-8' });

/**
 * Write json file.
 */
fs.writeFileSync('./password.json', JSON.stringify(json), { encoding: 'utf-8' });