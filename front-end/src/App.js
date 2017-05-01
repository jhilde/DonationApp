import React, { Component } from 'react';
import { Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import 'whatwg-fetch'
import * as Braintree from 'braintree-web';
import logo from './logo.svg';
import './App.css';
import AmountPanel from './Components/AmountPanel'
import InfoPanel from './Components/InfoPanel'
import CreditPanel from './Components/CreditPanel'
import ThankYouPanel from './Components/ThankYouPanel'


const panelTitle = (
    <h3>Bring Freedom This Summer</h3>
  )

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      donationStage:"amount",
      donationFrequency:"one-time",
      donationAmount:0,
      donationNonce:'',
      donorInfo: {
        firstName:'',
        lastName:'',
        email:'',
        address:'',
        city:'',
        state:'',
        zip:'',
        phone: ''
      }
    }
    
    this.updateFrequency = this.updateFrequency.bind(this);
    this.updateAmount = this.updateAmount.bind(this);
    this.completeStage = this.completeStage.bind(this);
    this.previousStage = this.previousStage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.processDonation = this.processDonation.bind(this);
    this.returnFromProcess = this.returnFromProcess.bind(this);

  }

  updateFrequency(frequency) {
    this.setState({donationFrequency:frequency})
  }

  updateAmount(amount) {
    this.setState({donationAmount:amount})
    //ready for next pane
  }

  serializeDonationData() {  
    return ({
      "donation_info" : 
      {
        "amount":this.state.donationAmount,
        "frequency" : this.state.donationFrequency
      },
      "donor_info": 
        {
          "first_name" : this.state.donorInfo.firstName, 
          "last_name" : this.state.donorInfo.lastName, 
          "email" : this.state.donorInfo.email, 
          "phone" : this.state.donorInfo.phone, 
          "address" : 
          {
            "street_address" : this.state.donorInfo.address, 
            "city" : this.state.donorInfo.city, 
            "state" : this.state.donorInfo.state,
            "zip" : this.state.donorInfo.zip
          }
        },
      "nonce" : this.state.donationNonce
    })
  } 

  returnFromProcess(json) {
    console.log(json);

    if(json.success) {
      this.setState({transactionId:json.transactionId})
      this.setState({subscriptionId:json.subscriptionId})
      this.completeStage('credit');
    }
    else {
      console.log("No success??")
      console.log(json)
    }
  }

  processDonation(nonce) {
    this.setState({donationNonce:nonce})
    const data = this.serializeDonationData();

    console.log(JSON.stringify(data))

    
    const urlDonation = 'https://plhky3gted.execute-api.us-east-1.amazonaws.com/dev/Donate'
    const headers = new Headers();
    headers.append("Content-Type", "application/json");  
      fetch(urlDonation, {
        method: 'post',
        headers: headers,
        body: JSON.stringify(data)
      })
      .then(function(response) {
        return response.json()
      })
      .then((json)=>this.returnFromProcess(json))
      .catch(function(e) {
        console.log("oh no!")
        console.log(e);
      });
    
    
    /*fetch('https://6z4mdckfb2.execute-api.us-east-1.amazonaws.com/dev/donate_donate_mock', {
	    method: 'post',
      mode: 'no-cors',
      headers: new Headers({
		    'Content-Type': 'application/json'
	    }),
	    body: JSON.stringify(data)
    })
    .then(function(response) {
        console.log(response.body);
        //return response.json()
      })
      //.then((json)=>this.setupBraintree(json.clientToken))
      .catch(function() {
      });

      */

//const url = 'https://ka1l8dezi6.execute-api.us-east-1.amazonaws.com/test/clientToken'

     // const url = 'https://6z4mdckfb2.execute-api.us-east-1.amazonaws.com/dev/donate_donate_mock'

//      fetch(url)
  //    .then(function(response) {
    //    return response.json()
     // })
      //.then((json)=>this.setupBraintree(json.clientToken))
      //.catch(function() {
      //});
  }

  completeStage(stage) {
    let nextStage
    
    switch(stage) {
      case 'amount':
        nextStage = 'info';
        break;
      case 'info':
        nextStage = 'credit';
        break;
      case 'credit':
        nextStage = 'thank-you';
        break;

    }
    this.setState({donationStage:nextStage})
  }

  previousStage(stage) {
    let previousStage

    switch(stage) {
      case 'info':
        previousStage = 'amount';
        break;
      case 'credit':
        previousStage = 'info';
        break;
    }

    this.setState({donationStage:previousStage})
  }

  handleChange(field, value) {
    let donorInfo = this.state.donorInfo;
    donorInfo[field] = value;
    this.setState({donorInfo: donorInfo});
  }

  render() {
    return (
      <Col xs={12} sm={12} md={5} mdOffset={7}>
        <Panel header={panelTitle}>
          <div id={'outerDiv'}>
            <AmountPanel 
              donationStage={this.state.donationStage}
              donationFrequency={this.state.donationFrequency}
              donationAmount={this.state.donationAmount}
              updateAmount={this.updateAmount}
              updateFrequency={this.updateFrequency}
              completeStage={this.completeStage}
            />
            <InfoPanel 
              donationStage={this.state.donationStage}
              donationFrequency={this.state.donationFrequency}
              donationAmount={this.state.donationAmount}
              donorInfo={this.state.donorInfo}
              updateAmount={this.updateAmount}
              updateFrequency={this.updateFrequency}
              handleChange={this.handleChange}
              completeStage={this.completeStage}
              previousStage={this.previousStage}
            />
            <CreditPanel 
              donationStage={this.state.donationStage}
              donationFrequency={this.state.donationFrequency}
              donationAmount={this.state.donationAmount}
              processDonation={this.processDonation}
              completeStage={this.completeStage}
              previousStage={this.previousStage}
            />
            <ThankYouPanel 
              donationStage={this.state.donationStage}
              donationFrequency={this.state.donationFrequency}
              donationAmount={this.state.donationAmount}
              transactionId={this.state.transactionId}
              subscriptionId={this.state.subscriptionId}
            />
          </div>
        </Panel>
      </Col>
    );
  }
}

export default App;
