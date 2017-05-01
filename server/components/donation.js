"use strict";

const braintree = require('braintree');
const helper = require('sendgrid').mail;

function BraintreeGateway(envVars) {
    const env = envVars.env === 'production' 
            ? braintree.Environment.Production 
            : braintree.Environment.Sandbox
    
    return braintree.connect({
        environment:        env,
        merchantId:         envVars.merchantId,
        publicKey:          envVars.publicKey,
        privateKey:         envVars.privateKey,
        merchantAccountId:  envVars.merchantAccountId 
    }); 
};

function sendTheMail(apiKey) {
    const sg = require('sendgrid')(apiKey);
    const fromEmail = new helper.Email('justin@freedomconnexion.org');
    const toEmail = new helper.Email('jhilde@gmail.com');
    const subject = 'Hello World from the SendGrid Node.js Library!';
    const content = new helper.Content('text/plain', 'Hello, Email!');
    const mail = new helper.Mail(fromEmail, subject, toEmail, content);

    console.log("apikey: " + apiKey);
    
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
        console.log("sending mail")
        if (error) {
            console.log('Error response received');
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    })
}
    
/*
    gateway.transaction.sale({
        amount: event.donation_info.amount,
        paymentMethodNonce: event.nonce,
        options: {
            submitForSettlement: true
        }
    }, function (err, result) {
         callback(null, result)
    });
    
   
} */


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
                'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'
            },
        body: JSON.stringify({btClientToken: response.clientToken})
    };
        
        callback(null, {btClientToken:response.clientToken});
    });
};

exports.btDonate = (event, envVars, callback) => {
    var donation = new Donation(event);
    const gateway = BraintreeGateway(envVars);

    console.log("here")
    console.log(event)
    if(donation.donation_info.frequency == "monthly") {
        const braintreeCustomer = new BraintreeCustomer(donation);

        gateway.customer.create(braintreeCustomer, function(err, result) {
            if(result) {
                if(result.success) {
                    console.log("Created customer: " + result.customer.id);
                    console.log("Created payement method: " + result.customer.creditCards[0].token);

                    var braintreeSubscription = new BraintreeSubscription(result.customer.creditCards[0].token, "monthly_donation",donation.donation_info.amount);

                    gateway.subscription.create(braintreeSubscription, function (err, result) {
                        if(result.success) {
                            console.log("Created subscription: " + result.subscription.id);
                            sendTheMail(envVars.sendGridApiKey);
                            /*sendEmail(donation.donor_info.email, donation.donor_info.first_name, donation.donor_info.last_name, donation.donation_info.amount, result.subscription.id).then(response => {
                                console.log(response.statusCode);
                                console.log(response.body);
                                console.log(response.headers);    
                            })
                            .catch(error => {
                                //error is an instance of SendGridError
                                //The full response is attached to error.response
                                console.log("Wow error with sendgrid:" + error.response);
                            })
                            .then(function() {
                                console.log("In the second then!");
                                callback(null, result);
                            });*/
                            callback(null, {
                                success:true,
                                subscriptionId:result.subscription.id
                            });
                        }
                        else {
                            callback(null, result);
                        }
                    });

                }
                else {
                    callback(null, result);
                }
            }
            else {
                callback(null, err);
            }            
        });
    }
    else {
        var braintreeSale = new BraintreeSale(donation);

      

        gateway.transaction.sale(braintreeSale, function(err, result) {
            if(result) {
                if(result.success) {
                    
                    console.log("Transction ID: " + result.transaction.id);
                    //Let's send the email
                    console.log("Sending to: " + donation.donor_info.email);
                    sendTheMail(envVars.sendGridApiKey);
                    /*sendEmail(donation.donor_info.email, donation.donor_info.first_name, donation.donor_info.last_name, donation.donation_info.amount, result.transaction.id).then(response => {
                        console.log(response.statusCode);
                        console.log(response.body);
                        console.log(response.headers);

                        
                    })
                    .catch(error => {
                        //error is an instance of SendGridError
                        //The full response is attached to error.response
                        console.log("Wow error with sendgrid:" + error.response);
                    })
                    .then(function() {
                        console.log("In the second then!");
                        callback(null, result);
                    });*/

                    callback(null, {
                        success:true,
                        transactionId: result.transaction.id
                    });
                    
                }
                else {
                    console.log(result.message);
                    callback(null, result);
                }
            }
            else {
                console.log(err);
                callback(err, "Error");
            }
        });


    }

    

};