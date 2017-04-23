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
      donorInfo: {
        firstName:'',
        lastName:'',
        email:'',
        address:'',
        city:'',
        state:'',
        zip:''
      }
    }
    
    this.updateFrequency = this.updateFrequency.bind(this);
    this.updateAmount = this.updateAmount.bind(this);
    this.completeStage = this.completeStage.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  updateFrequency(frequency) {
    this.setState({donationFrequency:frequency})
  }

  updateAmount(amount) {
    this.setState({donationAmount:amount})
    //ready for next pane
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

    }
    this.setState({donationStage:nextStage})
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
          />
          <CreditPanel 
            donationStage={this.state.donationStage}
            donationFrequency={this.state.donationFrequency}
            donationAmount={this.state.donationAmount}
            donorInfo={this.state.donorInfo}
            updateAmount={this.updateAmount}
            updateFrequency={this.updateFrequency}
            handleChange={this.handleChange}
            completeStage={this.completeStage}
          />
        </Panel>
      </Col>
    );
  }
}

export default App;
