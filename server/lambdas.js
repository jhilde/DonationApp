const donation = require('./components/donation');

exports.clientToken = (event, context, callback) => {
    donation.btClientToken(event.stageVariables, callback);
};

exports.donate = (event, context, callback) => {
    donation.btDonate(event.bodyJson, event.stageVariables, callback);
}

