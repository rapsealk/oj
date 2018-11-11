const moment = require('moment');

const week1 = moment('2018-09-07');
const now = moment('2018-11-15');

console.log(Math.floor((now - week1) / (24 * 60 * 60 * 1000) / 7) + 1);