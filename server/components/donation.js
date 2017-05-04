"use strict";

const braintree = require('braintree');
const helper = require('sendgrid').mail;
const accounting = require('accounting');

const oneTimeDonationEmailTemplateId = '13892749-bb1f-4dc7-9df3-da561a5eb8bf';
const monthlyDonationEmailTemplateId = '7bb2f030-b90f-4cc0-a0eb-3373d8cf361d';

function BraintreeGateway(envVars) {
    const env = envVars.env === 'production' ?
        braintree.Environment.Production :
        braintree.Environment.Sandbox

    return braintree.connect({
        environment: env,
        merchantId: envVars.merchantId,
        publicKey: envVars.publicKey,
        privateKey: envVars.privateKey,
        merchantAccountId: envVars.merchantAccountId
    });
};

function sendTheMail(apiKey, substitutions, templateId, callback) {
    const sg = require('sendgrid')(apiKey);
    const fromEmail = new helper.Email('justin@freedomconnexion.org');
    const toEmail = new helper.Email('jhilde@gmail.com');
    const subject = 'Thank you for your donation';
    const content = new helper.Content('text/html', ' ');
    const mail = new helper.Mail(fromEmail, subject, toEmail, content);

    for (const key in substitutions) {
        if (substitutions.hasOwnProperty(key)) {
            mail.personalizations[0].addSubstitution(
                new helper.Substitution(key, substitutions[key]));
        }
    }

    mail.setTemplateId(templateId);

    console.log("apikey: " + apiKey);

    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function(error, response) {
        console.log("sending mail")
        if (error) {
            console.log('Error response received');
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);

        callback(error, response);
    })
}

class Donation {
    constructor(n) {
        this.donation_info = {};
        this.donation_info.amount = n.donation_info.amount;
        this.donation_info.frequency = n.donation_info.frequency;

        this.donor_info = {};
        this.donor_info.first_name = n.donor_info.first_name;
        this.donor_info.last_name = n.donor_info.last_name;
        this.donor_info.email = n.donor_info.email;
        this.donor_info.phone = n.donor_info.phone;

        this.donor_info.address = {};
        this.donor_info.address.street_address = n.donor_info.address.street_address;
        this.donor_info.address.city = n.donor_info.address.city;
        this.donor_info.address.state = n.donor_info.address.state;
        this.donor_info.address.zip = n.donor_info.address.zip;

        this.nonce = n.nonce;
    }
}



class BraintreeSale {
    constructor(donation) {
        this.amount = donation.donation_info.amount;
        this.paymentMethodNonce = donation.nonce;

        this.customer = {};
        this.customer.firstName = donation.donor_info.first_name;
        this.customer.lastName = donation.donor_info.last_name;
        this.customer.phone = donation.donor_info.phone;
        this.customer.email = donation.donor_info.email;

        this.billing = {};
        this.billing.streetAddress = donation.donor_info.address.street_address;
        this.billing.extendedAddress = donation.donor_info.address.extended_address;
        this.billing.locality = donation.donor_info.address.city;
        this.billing.region = donation.donor_info.address.state;
        this.billing.postalCode = donation.donor_info.address.zip;

        this.options = {};
        this.options.submitForSettlement = true;
    }

}

class BraintreeCustomer {
    constructor(donation) {
        this.paymentMethodNonce = donation.nonce;

        this.firstName = donation.donor_info.first_name;
        this.lastName = donation.donor_info.last_name;
        this.phone = donation.donor_info.phone;
        this.email = donation.donor_info.email;

        this.creditCard = {};

        this.creditCard.billingAddress = {};
        this.creditCard.billingAddress.firstName = donation.donor_info.first_name;
        this.creditCard.billingAddress.lastName = donation.donor_info.last_name;
        this.creditCard.billingAddress.streetAddress = donation.donor_info.address.street_address;
        this.creditCard.billingAddress.extendedAddress = donation.donor_info.address.extended_address;
        this.creditCard.billingAddress.locality = donation.donor_info.address.city;
        this.creditCard.billingAddress.region = donation.donor_info.address.state;
        this.creditCard.billingAddress.postalCode = donation.donor_info.address.zip;
    }
}

class BraintreeSubscription {
    constructor(cardToken, planId, amount) {
        this.paymentMethodToken = cardToken;
        this.planId = planId;
        this.price = amount;
    }
}

exports.btClientToken = (envVars, callback) => {
    var gateway = BraintreeGateway(envVars);

    gateway.clientToken.generate({}, function(err, response) {
        var responseold = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ btClientToken: response.clientToken })
        };

        callback(null, { btClientToken: response.clientToken });
    });
};

exports.btDonate = (event, envVars, callback) => {
    const donation = new Donation(event);
    const gateway = BraintreeGateway(envVars);

    if (donation.donation_info.frequency == "monthly") {
        const braintreeCustomer = new BraintreeCustomer(donation);

        gateway.customer.create(braintreeCustomer, function(err, result) {
            if (result) {
                if (result.success) {
                    var braintreeSubscription = new BraintreeSubscription(result.customer.creditCards[0].token, "monthly_donation", donation.donation_info.amount);

                    gateway.subscription.create(braintreeSubscription, function(err, result) {
                        if (result.success) {
                            sendTheMail(
                                envVars.sendGridApiKey, {
                                    DONOR_FIRST: donation.donor_info.first_name,
                                    AMOUNT: accounting.formatMoney(donation.donation_info.amount),
                                    SUBSCRIPTION_ID: result.subscription.id
                                },
                                monthlyDonationEmailTemplateId,
                                function(error, response) {
                                    callback(null, {
                                        success: true,
                                        subscriptionId: result.subscription.id
                                    });
                                });

                        } else {
                            callback(null, result);
                        }
                    });

                } else {
                    callback(null, result);
                }
            } else {
                callback(null, err);
            }
        });
    } else {
        var braintreeSale = new BraintreeSale(donation);

        gateway.transaction.sale(braintreeSale, function(err, result) {
            if (result) {
                if (result.success) {
                    sendTheMail(
                        envVars.sendGridApiKey, {
                            DONOR_FIRST: donation.donor_info.first_name,
                            AMOUNT: accounting.formatMoney(donation.donation_info.amount),
                            TRANSACTION_ID: result.transaction.id
                        },
                        oneTimeDonationEmailTemplateId,
                        function(error, response) {
                            callback(null, {
                                success: true,
                                transactionId: result.transaction.id
                            });
                        });

                    sendTheMail(envVars.sendGridApiKey, function(err, response) {
                        callback(null, {
                            success: true,
                            transactionId: result.transaction.id
                        });
                    });
                } else {
                    console.log(result.message);
                    callback(null, result);
                }
            } else {
                console.log(err);
                callback(err, "Error");
            }
        });


    }



};