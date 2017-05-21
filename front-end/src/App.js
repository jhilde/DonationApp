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
import Amplitude from 'react-amplitude';



const panelTitle = (
  <div>
    <h3> Give Freedom Today </h3>
  </div>
  )

    class App extends Component {

      constructor(props) {
        super(props)
        this.state = {
          donationStage: "amount",
          donationFrequency: "one-time",
          donationAmount: 0,
          donationNonce: '',
          donorInfo: {
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            phone: ''
          },
          processing: false
        }

        this.updateFrequency = this.updateFrequency.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.completeStage = this.completeStage.bind(this);
        this.previousStage = this.previousStage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.nonceWasGenerated = this.nonceWasGenerated.bind(this);
        this.processDonation = this.processDonation.bind(this);
        this.returnFromProcess = this.returnFromProcess.bind(this);
        
        Amplitude.initialize('a55caf6e3734d1d0b9cc15e611a0a18b');
      }

      updateFrequency(frequency) {
        this.setState({ donationFrequency: frequency })
      }

      updateAmount(amount) {
        this.setState({ donationAmount: amount })
          //ready for next pane
      }

      serializeDonationData() {
        return ({
          "donation_info": {
            "amount": this.state.donationAmount,
            "frequency": this.state.donationFrequency
          },
          "donor_info": {
            "first_name": this.state.donorInfo.firstName,
            "last_name": this.state.donorInfo.lastName,
            "email": this.state.donorInfo.email,
            "phone": this.state.donorInfo.phone,
            "address": {
              "street_address": this.state.donorInfo.address,
              "city": this.state.donorInfo.city,
              "state": this.state.donorInfo.state,
              "zip": this.state.donorInfo.zip
            }
          },
          "nonce": this.state.donationNonce
        })
      }

      returnFromProcess(json) {
        if (json.success) {
          this.setState({
            transactionId: json.transactionId,
            subscriptionId: json.subscriptionId,
            processing: false
          })
          this.completeStage('credit');
          Amplitude.event('Completed Donation', {
            transactionId: json.transactionId,
            subscriptionId: json.subscriptionId,
            amount: this.state.donationAmount,
            frequency: this.state.donationFrequency
          });

          const revenue = new Amplitude.amplitude().Revenue();
          revenue.setProductId(this.state.donationFrequency)
          revenue.setPrice(this.state.donationAmount);
          Amplitude.amplitude().logRevenueV2(revenue);
          console.log(revenue);

        } else {
          this.setState({ 
            processorErrors: true, 
            processorErrorMessage: json.err.message,
            processing:false
          })
          Amplitude.event('BTError', {error:json.err.message});
        }
      }

      nonceWasGenerated(tokenizeErr, payload) {
       if(tokenizeErr) {
        this.setState({ 
            processorErrors: true, 
            processorErrorMessage: 'Server error'
          })
        Amplitude.event('BTError', {error:tokenizeErr});
        
        }
        
      else {
        this.processDonation(payload.nonce)
      }
  }
      
      processDonation(nonce) {
        this.setState(
          { 
            donationNonce: nonce,
            processing: true
          })
        const data = this.serializeDonationData();

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
          .then((json) => this.returnFromProcess(json))
          .catch((e) => function (){
            this.setState({ 
              processorErrors: true, 
              processorErrorMessage: 'Server error',
              processing: false
            })
            Amplitude.event('BTError', {error:e});
            
          });
      }

      completeStage(stage) {
        let nextStage

        switch (stage) {
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

        window.scrollTo(0,0);
        this.setState({ donationStage: nextStage })
      }

      previousStage(stage) {
        let previousStage

        switch (stage) {
          case 'info':
            previousStage = 'amount';
            break;
          case 'credit':
            previousStage = 'info';
            break;
        }
        window.scrollTo(0,0);
        this.setState({ donationStage: previousStage })
      }

      handleChange(field, value) {
        let donorInfo = this.state.donorInfo;
        donorInfo[field] = value;
        this.setState({ donorInfo: donorInfo });
      }

      render() {
        return ( 
          <Col xs = { 12 } sm = { 12 } md = { 5 } mdOffset = { 7 } >
            <Panel header = { panelTitle } >
          < div 
            id = { 'outerDiv' } 
            className = {this.state.processing ? 'processing' : ''}>
          <
          AmountPanel donationStage = { this.state.donationStage }
          donationFrequency = { this.state.donationFrequency }
          donationAmount = { this.state.donationAmount }
          updateAmount = { this.updateAmount }
          updateFrequency = { this.updateFrequency }
          completeStage = { this.completeStage }
          /> <
          InfoPanel donationStage = { this.state.donationStage }
          donationFrequency = { this.state.donationFrequency }
          donationAmount = { this.state.donationAmount }
          donorInfo = { this.state.donorInfo }
          updateAmount = { this.updateAmount }
          updateFrequency = { this.updateFrequency }
          handleChange = { this.handleChange }
          completeStage = { this.completeStage }
          previousStage = { this.previousStage }
          /> <
          CreditPanel donationStage = { this.state.donationStage }
          donationFrequency = { this.state.donationFrequency }
          donationAmount = { this.state.donationAmount }
          processDonation = { this.processDonation }
          completeStage = { this.completeStage }
          previousStage = { this.previousStage }
          nonceWasGenerated = { this.nonceWasGenerated }
          processorErrors = { this.state.processorErrors }
          processorErrorMessage = { this.state.processorErrorMessage }
          processing = {this.state.processing }
          /> <
          ThankYouPanel donationStage = { this.state.donationStage }
          donationFrequency = { this.state.donationFrequency }
          donationAmount = { this.state.donationAmount }
          transactionId = { this.state.transactionId }
          subscriptionId = { this.state.subscriptionId }
          /> < /
          div > <
          /Panel> < /
          Col >
        );
      }
    }

    export default App;