require('dotenv').config();
var mysql = require('mysql');
const utils = require("./utils.js");

var DB_TC = mysql.createConnection({
    host: process.env.TC_HOST,
    user: process.env.TC_USER,
    password: process.env.TC_PASS,
    database: process.env.TC_DB
});

var DB_DEV = mysql.createConnection({
    host: process.env.DEV_HOST,
    user: process.env.DEV_USER,
    password: process.env.DEV_PASS,
    database: process.env.DEV_DB
});

var DB_PROD = mysql.createConnection({
    host: process.env.PROD_HOST,
    user: process.env.PROD_USER,
    password: process.env.PROD_PASS,
    database: process.env.PROD_DB
});

var emailBody = 'Batch Failure:\n';
var hasError = false;
var step = 0;
function next_process() {
    switch (step) {
        case 0:
            console.log('Checking TC');
            check_failure(DB_TC);
            break;
        case 1:
            console.log('Checking DEV')
            check_failure(DB_DEV);
            break;
        case 2:
            console.log('Checking PROD')
            check_failure(DB_PROD);
            break;
        case 3:
            if (hasError) {
                console.log('Reporting..');
                utils.send_slack({ text: emailBody });
                //utils.send_email();
            }
            process.exit();
            break;
    }
    step++;
};

function check_failure(con) {
    con.connect(function (err) {
        if (err) utils.send_slack({ channel: process.env.SLACK_ERI, text: 'ERCON: ' + con });

        con.query(`CALL bat_report_failure();`, function (err, res, fields) {
            if (err) {
                console.log(err);
                utils.send_slack({ channel: process.env.SLACK_ERI, text: 'ERBAT: ' + con + ': ' + err });
                next_process();
            }

            var result = res[0];
            if (result.length) {
                hasError = true;
                for (var x in result) {
                    emailBody += result[x]['server_name'] + ' ' + result[x]['script_name'] + ' at ' + result[x]['start_time'] + '\n';
                }

                next_process();
            } else {
                console.log('No Failure');
                next_process();
            }
        });
    });
}

console.log(new Date().toISOString());
next_process();