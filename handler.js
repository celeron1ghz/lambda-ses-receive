'use strict';

module.exports.main = (event, context, callback) => {
    const file = event.Records[0].s3.object.key;
    console.log("received", file);
    callback(null, "OK");
};
