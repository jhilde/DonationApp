import React, { Component } from 'react';
import { Pager, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import { DonationAmountButton, FieldGroup, isCurrency } from './Helpers';
import Amplitude from 'react-amplitude';

import '../App.css';


class AmountPanel extends Component {
  constructor(props) {
    super(props)

    this.state = {
      otherDonationAmount: '',
      buttonAmounts: this.setupButtonAmounts()
    }

    this.otherAmountChanged = this.otherAmountChanged.bind(this)
    this.frequencyClicked = this.frequencyClicked.bind(this)
  }

  setupButtonAmounts(which) {
    const monthlyAmounts = [10, 15, 20, 25, 30, 35, 40]
    const oneTimeAmounts = [10, 25, 50, 100, 150, 200, 500]

    return which == 'monthly' ? monthlyAmounts : oneTimeAmounts
  }

  frequencyClicked(which, e) {
    this.props.updateFrequency(which);

    this.setState({
      buttonAmounts: this.setupButtonAmounts(which)
    })

    this.forceUpdate()

    Amplitude.event('Frequency Changed', {frequency:which});

  }

  amountClicked(amount, e) {
    this.props.updateAmount(amount);
    this.props.completeStage("amount")

    Amplitude.event('Amount Clicked', {amount:amount});
  }

  otherAmountChanged(e) {
    if (isCurrency(e.target.value) || e.target.value == '') {
      this.setState({ otherDonationAmount: e.target.value })
    }
  }

  nextClicked(e) {
    if (this.state.otherDonationAmount >= 10) {
      this.props.updateAmount(this.state.otherDonationAmount);
      this.props.completeStage("amount");
      Amplitude.event('Amount Entered', {amount:this.state.otherDonationAmount})
    } else {
      this.setState({ otherAmountHelpText: "Please enter an amount greater than $10." })
    }
  

  }



  render() {
    if(this.props.donationStage !== 'amount') return null;
    
    return ( 
      <div className = { this.props.donationStage === 'amount' ? '' : 'hidden' } >
        <Row>
          <Col xs={12}>
            <p>At Freedom Connexion we work to reduce the achivement gap between students from lower and higher income families.</p>
            <p>We do this by engaging some pretty amazing Kindergarten - 8th grade students in a 6-week literacy and STEAM program rooted in the Civil Rights movement.</p>
            <p>We're only able to do this at no cost to the families because of the generosity of <strong>people just like you</strong>.</p>
            <p>Will you join us in bringing this program to our amazing scholars? <strong>Give generously today</strong></p>
          </Col>
        </Row>
        
        <Row>
          <Col xs={3}>
          <Button bsClass = { this.props.donationFrequency === 'one-time' ? 'btn btn-link active' : 'btn btn-link' } onClick = {(e) => this.frequencyClicked("one-time", e) } > 
          One - time 
          </Button> 
          </Col>
          <Col xs={3}>
          <Button bsClass = { this.props.donationFrequency === 'monthly' ? 'btn btn-link active' : 'btn btn-link' } onClick = {(e) => this.frequencyClicked("monthly", e) } > 
          Monthly 
          </Button> 
          </Col>
          <Col xs={6}>
          <FontAwesome name = 'hand-o-left' size = 'lg' />
          &nbsp;We&nbsp;
          <FontAwesome name = 'heart' size = 'lg' style={{color:'#FF0000'}} />
          &nbsp;our monthly supporters! Click here to become one.
          </Col>
          </Row> 
        <Row>
          <DonationAmountButton amount = { this.state.buttonAmounts[0] }
              onClick = {
                (e) => this.amountClicked(this.state.buttonAmounts[0], e) }
          /> 
          <DonationAmountButton amount = { this.state.buttonAmounts[1] }
              onClick = {
                (e) => this.amountClicked(this.state.buttonAmounts[1], e) }
          /> 
          <DonationAmountButton amount = { this.state.buttonAmounts[2] }
              onClick = {
                (e) => this.amountClicked(this.state.buttonAmounts[2], e) }
          /> 
        </Row> 
        <Row >
          <DonationAmountButton amount = { this.state.buttonAmounts[3] }
            onClick = {
              (e) => this.amountClicked(this.state.buttonAmounts[3], e) }
          /> 
          <DonationAmountButton amount = { this.state.buttonAmounts[4] }
            onClick = {
              (e) => this.amountClicked(this.state.buttonAmounts[4], e) }
          /> 
          <DonationAmountButton amount = { this.state.buttonAmounts[5] }
            onClick = {
              (e) => this.amountClicked(this.state.buttonAmounts[5], e) }
          /> 
        </Row> 
        <Row>
          <DonationAmountButton amount = { this.state.buttonAmounts[6] }
            onClick = {
              (e) => this.amountClicked(this.state.buttonAmounts[6], e) }
          /> 
        <Col xs = { 8 }>
          <FieldGroup id = "otherAmount"
            type = "text"
            placeholder = "Other Amount"
            help = { this.state.otherAmountHelpText }
            value = { this.state.otherDonationAmount }
            onChange = { this.otherAmountChanged }
          /> 
        </Col> 
      </Row> 
      <Row >
        <Col xs = { 10 } xsOffset = { 1 }>
          <Pager>
            <Pager.Item onSelect = {
              (e) => this.nextClicked(e) } 
            > 
              Next&nbsp; 
              <FontAwesome name = 'arrow-circle-right' size = 'lg' /> 
            </Pager.Item> 
          </Pager> 
        </Col> 
      </Row> 
    </div>
    );
  }
}

export default AmountPanel;