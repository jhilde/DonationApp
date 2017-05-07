"use strict";

const braintree = require("braintree");
const helper = require("sendgrid").mail;
const accounting = require("accounting");
const promise = require("bluebird");
const validator = require("validator");
require("array.prototype.includes")

const oneTimeDonationEmailTemplateId = "13892749-bb1f-4dc7-9df3-da561a5eb8bf";
const monthlyDonationEmailTemplateId = "7bb2f030-b90f-4cc0-a0eb-3373d8cf361d";
const states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']



function BraintreeGateway(envVars) {
  const env = envVars.env === "production" ?
    braintree.Environment.Production :
    braintree.Environment.Sandbox;

  return braintree.connect({
    environment: env,
    merchantId: envVars.merchantId,
    publicKey: envVars.publicKey,
    privateKey: envVars.privateKey,
    merchantAccountId: envVars.merchantAccountId
  });
}

function isZip(value) {
  return /^\d{5}(-\d{4})?$/.test(value);
}

function isValidValue(testValue, validValues) {
  return validValues.includes(testValue);
}


function validateInputAndSet(validateFunction, testValue, errorText, errors) {
  if (testValue && validateFunction(testValue)) {
    return testValue;
  } else {
    errors.push(errorText);
    return '';
  }
}

function sendTheMail(apiKey, substitutions, templateId) {
  const sg = require("sendgrid")(apiKey);
  promise.promisifyAll(sg);

  const fromEmail = new helper.Email("justin@freedomconnexion.org");
  const toEmail = new helper.Email("jhilde@gmail.com");
  const subject = "Thank you for your donation";
  const content = new helper.Content("text/html", " ");
  const mail = new helper.Mail(fromEmail, subject, toEmail, content);

  for (const key in substitutions) {
    if (substitutions.hasOwnProperty(key)) {
      mail.personalizations[0].addSubstitution(
        new helper.Substitution(key, substitutions[key])
      );
    }
  }

  mail.setTemplateId(templateId);

  const request = sg.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: mail.toJSON()
  });

  return sg.APIAsync(request)
    .catch(function(err) {
      // Just log the email failure 
      // No need to notify user
      console.log("Email failure")
      console.log(request)
      console.log(err)
    });
}

class Donation {
  constructor(n) {
    let errors = [];

    this.donation_info = {};
    this.donation_info.amount = n.donation_info.amount;
    if (n.donation_info.amount < 10) {
      errors.push('Amount is less than $10.');
    }
    this.donation_info.frequency = n.donation_info.frequency;

    this.donor_info = {};

    this.donor_info.first_name = validateInputAndSet(validator.isAlpha, n.donor_info.first_name, "Missing valid first name.", errors);
    this.donor_info.last_name = validateInputAndSet(validator.isAlpha, n.donor_info.last_name, "Missing valid last name.", errors);
    this.donor_info.email = validateInputAndSet(validator.isEmail, n.donor_info.email, "Missing valid email.", errors);
    this.donor_info.phone = n.donor_info.phone;

    this.donor_info.address = {};
    this.donor_info.address.street_address = validateInputAndSet(validator.isAscii, n.donor_info.address.street_address, "Missing valid street address.", errors);
    this.donor_info.address.city = validateInputAndSet(validator.isAlpha, n.donor_info.address.city, "Missing valid city.", errors);


    if (isValidValue(n.donor_info.address.state, states)) {
      this.donor_info.address.state = n.donor_info.address.state;
    } else {
      errors.push('Missing valid state')
    }


    this.donor_info.address.zip = validateInputAndSet(isZip, n.donor_info.address.zip, "Missing valid zip code.", errors);

    this.nonce = n.nonce;


    if (errors.length > 0) {
      console.log("pushing errors")
      throw errors.join(" ");
    }
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
    this.creditCard.billingAddress.streetAddress =
      donation.donor_info.address.street_address;
    this.creditCard.billingAddress.extendedAddress =
      donation.donor_info.address.extended_address;
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

function createErrorResponse(btError) {
  return {
    success: 'false',
    err: {
      type: btError.type,
      name: btError.name,
      message: btError.message
    }
  }
};

exports.btClientToken = (envVars, callback) => {
  const gateway = BraintreeGateway(envVars);

  gateway.clientToken.generate({}, function(err, response) {
    const responseold = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ btClientToken: response.clientToken })
    };

    callback(null, { btClientToken: response.clientToken });
  });
};

exports.btDonate = (event, envVars, callback) => {

  let donation;

  try {
    donation = new Donation(event);
  } catch (err) {
    callback(null, {
      success: false,
      err: {
        type: 'validation',
        message: err
      }
    })
    return
  }

  const gateway = BraintreeGateway(envVars);



  if (donation.donation_info.frequency == "monthly") {

    // Promisify BT Customer Create
    const btCustomerCreate = promise.promisify(gateway.customer.create, {
      context: gateway.customer
    });

    // Promisify BT Subscription Create
    const btSubscriptionCreate = promise.promisify(gateway.subscription.create, {
      context: gateway.subscription
    });

    const braintreeCustomer = new BraintreeCustomer(donation);

    btCustomerCreate(braintreeCustomer)
      .then(function(result) {
        if (result && result.success) {
          const braintreeSubscription = new BraintreeSubscription(
            result.customer.creditCards[0].token,
            "monthly_donation",
            donation.donation_info.amount
          );

          btSubscriptionCreate(braintreeSubscription)
            .then(function(result) {
              if (result && result.success) {
                sendTheMail(
                    envVars.sendGridApiKey, {
                      DONOR_FIRST: donation.donor_info.first_name,
                      AMOUNT: accounting.formatMoney(donation.donation_info.amount),
                      SUBSCRIPTION_ID: result.subscription.id
                    },
                    monthlyDonationEmailTemplateId
                  )
                  .then(function() {
                    callback(null, {
                      success: true,
                      subscriptionId: result.subscription.id
                    });
                  })
                  .catch(function(err) {
                    console.log("Unknown error");
                    console.log(err);
                    callback(err);
                  });
              } else {
                callback(null, {
                  success: false,
                  err: {
                    type: 'processor',
                    message: result.message
                  }
                });
              }
            })
            .catch(function(err) {
              console.log("Unknown error");
              console.log(err);
              callback(err);
            });
        } else {
          // Either result is unknown or result.status is false
          if (!result) {
            console.log("Unknown error");
          } else {
            callback(null, {
              success: false,
              err: {
                type: 'processor',
                message: result.message
              }
            });
          }
        }
      });
  }
  else {
    
    // Promisify BT Transaction Sale
    const btTransactionSale = promise.promisify(gateway.transaction.sale, {
      context: gateway.transaction
    });
    
    const braintreeSale = new BraintreeSale(donation);

    btTransactionSale(braintreeSale)
      .then(function(result) {
        if (result && result.success) {
          sendTheMail(
            envVars.sendGridApiKey, {
              DONOR_FIRST: donation.donor_info.first_name,
              AMOUNT: accounting.formatMoney(donation.donation_info.amount),
              TRANSACTION_ID: result.transaction.id
            },
            oneTimeDonationEmailTemplateId
          )
          .then(function() {
            callback(null, {
              success: true,
              transactionId: result.transaction.id
            });
          })
          .catch(function(err) {
            console.log("Unknown error");
            console.log(err);
            callback(err);
          });
        }
        else {
          // Either result is unknown or result.status is false
          if (!result) {
            console.log("Unknown error");
          } else {
            callback(null, {
              success: false,
              err: {
                type: 'processor',
                message: result.message
              }
            });
          }
        }
      });
  }
}
      
/*

  gateway.transaction.sale(braintreeSale, function(err, result) {
      if (result) {
        if (result.success) {
          sendTheMail(
              envVars.sendGridApiKey, {
                DONOR_FIRST: donation.donor_info.first_name,
                AMOUNT: accounting.formatMoney(donation.donation_info.amount),
                TRANSACTION_ID: result.transaction.id
              },
              oneTimeDonationEmailTemplateId)
            .then(function() {
              callback(null, {
                success: true,
                transactionId: result.transaction.id
              });
            })
            .catch(function(error) {

            })
        );

        sendTheMail(envVars.sendGridApiKey).then(function() {
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
};*/