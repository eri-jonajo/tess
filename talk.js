require('dotenv').config();
const utils = require("./utils.js");

//utils.send_slack({ text: 'test' });
if (process.argv.length == 3)
    utils.send_slack({ text: process.argv[2].replace(/\\n/ig, '\n') });
else if (process.argv.length == 4)
    utils.send_slack({ channel: process.env['SLACK_' + process.argv[2]], text: process.argv[3].replace(/\\n/ig, '\n') });
else
    console.log(process.env.SLACK_ERI);