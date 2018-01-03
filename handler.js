'use strict';

process.env.AWS_REGION = 'ap-northeast-1';

const vo  = require('vo');
const req = require('request-promise');
const aws = require('aws-sdk');
const s3  = new aws.S3({ region: 'ap-northeast-1' });
const ses = new aws.SES({ region: 'us-east-1' });
const ssm = new aws.SSM();
const MailParser   = require('mailparser').simpleParser;
const MailComposer = require('nodemailer/lib/mail-composer');

module.exports.main = (event, context, callback) => {
    vo(function*(){
        const key = event.Records[0].s3.object.key;
        console.log("RECEIVED", key);

        const token    = (yield ssm.getParameter({ Name: '/acceptessa/token',    WithDecryption: true }).promise() ).Parameter.Value;
        const endpoint = (yield ssm.getParameter({ Name: '/sesreceive/endpoint', WithDecryption: true }).promise() ).Parameter.Value;

        const object   = yield s3.getObject({ Bucket: 'camelon-inbox', Key: key }).promise()
        const parsed   = yield new Promise((resolve,reject) =>
            MailParser(object.Body, (err, mail) => { if (err) {reject(err)} else {resolve(mail)} })
        );

        if (!parsed.text) {
            console.log("looks like not a mail. ignore...");
            return callback(null, "IGNORE");
        }

        const attachments = parsed.attachments
            ? [parsed.attachments].concat(parsed.attachments)
            : [{ filename: 'attach.txt', content: object.Body }];

        //const from    = parsed.from.text.match(/^.*?<(\w+@\w+\.\w+)>$/)[1];
        //const to      = parsed.to.text.match(/^.*?<?(\w+@\w+\.\w+)>?$/)[1];
        const from    = parsed.from.text;
        const to      = parsed.to.text;

        console.log("MAIL_INFO_GET", endpoint);
        const address = yield req({ uri: endpoint, method: 'POST', formData: { from: from, to: to, token: token } });
        const data    = JSON.parse(address);
        const circles = data.circles.map(a => `[${a.exhibition_id}] ${a.circle_name} / ${a.penname}`).sort();
        const text    = circles.length == 0 ? ['CIRCLE NOT FOUND'] : circles;

        text.unshift(
            '------------------------------',
            //`To: ${parsed.to.text}`,
            `To: celeron1ghz@gmail.com`,
            `From: ${parsed.from.text}`
        );

        text.push(
            '------------------------------',
            '\n',
            parsed.text
        );

        const built = new MailComposer({
            subject: parsed.subject,
            from:    to,
            to:      data.mail_address,
            text:    text.join("\n"),
            attachments: attachments,
        });

        const send = yield new Promise((resolve,reject) =>
            built.compile().build((err,mes) => { if (err) {reject(err)} else {resolve(mes)}  })
        );

        console.log("TO", data.mail_address);
        console.log("ATTACHMENTS", attachments.length);
        console.log("PUT_MAIL_QUEUE", key);
        const ret = yield ses.sendRawEmail({ RawMessage: { Data: send.toString() } }).promise();

        callback(null, "OK");
    })
    .catch(err => {
        console.log("Error happen:", err);
        callback(err);
    });
};
