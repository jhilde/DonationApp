import React, { Component } from 'react';
import { Pager, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import { DonationAmountButton, FieldGroup, isCurrency } from './Helpers';
//import { isCurrency } from 'validator';

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

  }

  amountClicked(amount, e) {
    this.props.updateAmount(amount);
    this.props.completeStage("amount")
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
    } else {
      this.setState({ otherAmountHelpText: "Please enter an amount greater than $10." })
    }

  }



  render() {
    return ( <
      div className = { this.props.donationStage === 'amount' ? '' : 'hidden' } >
      <
      Row >
      <
      Button bsClass = { this.props.donationFrequency === 'one-time' ? 'btn btn-link active' : 'btn btn-link' }
      onClick = {
        (e) => this.frequencyClicked("one-time", e) } > One - time < /Button> <
      Button bsClass = { this.props.donationFrequency === 'monthly' ? 'btn btn-link active' : 'btn btn-link' }
      onClick = {
        (e) => this.frequencyClicked("monthly", e) } > Monthly < /Button> <
      /Row> <
      Row >
      <
      DonationAmountButton amount = { this.state.buttonAmounts[0] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[0], e) }
      /> <
      DonationAmountButton amount = { this.state.buttonAmounts[1] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[1], e) }
      /> <
      DonationAmountButton amount = { this.state.buttonAmounts[2] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[2], e) }
      /> <
      /Row> <
      Row >
      <
      DonationAmountButton amount = { this.state.buttonAmounts[3] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[3], e) }
      /> <
      DonationAmountButton amount = { this.state.buttonAmounts[4] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[4], e) }
      /> <
      DonationAmountButton amount = { this.state.buttonAmounts[5] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[5], e) }
      /> <
      /Row> <
      Row >
      <
      DonationAmountButton amount = { this.state.buttonAmounts[6] }
      onClick = {
        (e) => this.amountClicked(this.state.buttonAmounts[6], e) }
      /> <
      Col xs = { 8 } >
      <
      FieldGroup id = "otherAmount"
      type = "text"
      placeholder = "Other Amount"
      help = { this.state.otherAmountHelpText }
      value = { this.state.otherDonationAmount }
      onChange = { this.otherAmountChanged }
      /> <
      /Col> <
      /Row> <
      Row >
      <
      Col xs = { 10 }
      xsOffset = { 1 } >
      <
      Pager >
      <
      Pager.Item onSelect = {
        (e) => this.nextClicked(e) } > Next < FontAwesome name = 'arrow-circle-right'
      size = 'lg' / > < /Pager.Item> <
      /Pager> <
      /Col> <
      /Row> <
      /div>
    );
  }
}

export default AmountPanel;