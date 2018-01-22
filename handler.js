'use strict';

process.env.AWS_REGION = 'ap-northeast-1';

const vo  = require('vo');
const aws = require('aws-sdk');
const s3  = new aws.S3({ region: 'ap-northeast-1' });
const ses = new aws.SES({ region: 'us-east-1' });
const MailParser   = require('mailparser').simpleParser;
const MailComposer = require('nodemailer/lib/mail-composer');

const config = require('./config.js');

module.exports.main = (event, context, callback) => {
    vo(function*(){
        const key = event.Records[0].s3.object.key;
        console.log("RECEIVED", key);

        const object   = yield s3.getObject({ Bucket: 'camelon-inbox', Key: key }).promise()
        const parsed   = yield new Promise((resolve,reject) =>
            MailParser(object.Body, (err, mail) => { if (err) {reject(err)} else {resolve(mail)} })
        );

        if (!parsed.text) {
            console.log("INVALID_FORMAT_MAIL");
            return callback(null, "IGNORE");
        }

        //const from    = parsed.from.text.match(/^.*?<(\w+@\w+\.\w+)>$/)[1];
        //const to      = parsed.to.text.match(/^.*?<?(\w+@\w+\.\w+)>?$/)[1];
        const from      = parsed.from.text;
        const to        = parsed.to.text;

        const to_domain  = to.split('@')[1];
        const forward_to = config[to_domain];

        if (!forward_to)    {
            console.log("UNKNOWN_HOST:", to_domain);
            return callback(null, "IGNORE");
        }

        const text = [
            '------------------------------',
            `To: ${parsed.to.text}`,
            `From: ${parsed.from.text}`,
            '------------------------------',
            '\n',
            parsed.text,
        ];

        const attachments = parsed.attachments
            ? [parsed.attachments].concat(parsed.attachments)
            : [{ filename: 'attach.txt', content: object.Body }];

        const built = new MailComposer({
            subject: parsed.subject,
            from:    to,
            to:      forward_to,
            text:    text.join("\n"),
            attachments: attachments,
        });

        const send = yield new Promise((resolve,reject) =>
            built.compile().build((err,mes) => { if (err) {reject(err)} else {resolve(mes)}  })
        );

        console.log(`${to} ==> ${forward_to} (attachments=${attachments.length})`);
        const ret = yield ses.sendRawEmail({ RawMessage: { Data: send.toString() } }).promise();
        callback(null, "OK");
    })
    .catch(err => {
        console.log("Error happen:", err.description);
        callback(err);
    });
};
