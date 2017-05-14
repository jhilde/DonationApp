import React, { Component } from 'react';
import { Pager, ButtonToolbar, Well, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import { FieldGroup, FieldGroupSelect } from './Helpers'
import { isAlpha, isAscii, isEmpty, isEmail } from 'validator'
import Amplitude from 'react-amplitude';
import '../App.css';

const states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

class InfoPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      firstNameHelp: "",
      lastNameHelp: "",
      emailHelp: "",
      addressHelp: "",
      cityHelp: "",
      zipHelp: ""
    }
    this.onChange = this.onChange.bind(this);
    this.nextClicked = this.nextClicked.bind(this);
    this.previousClicked = this.previousClicked.bind(this);
  }

  validateInputAndSet(validateFunction, testValue, helpName, helpText) {
    if (validateFunction(testValue)) {
      this.setState({
        [helpName]: '' });
      return true;
    } else {
      this.setState({
        [helpName]: helpText });
      return false;
    }
  }

  isZip(value) {
    return /^\d{5}(-\d{4})?$/.test(value);
  }

  nextClicked(e) {
    const complete = [
      this.validateInputAndSet(isAlpha, this.props.donorInfo.firstName, 'firstNameHelp', 'Please enter your first name'),
      this.validateInputAndSet(isAlpha, this.props.donorInfo.lastName, 'lastNameHelp', 'Please enter your last name'),
      this.validateInputAndSet(isEmail, this.props.donorInfo.email, 'emailHelp', 'Please enter your email address'),
      this.validateInputAndSet(isAscii, this.props.donorInfo.address, 'addressHelp', 'Please enter your address', true),
      this.validateInputAndSet(isAlpha, this.props.donorInfo.city, 'cityHelp', 'Please enter your city'),
      this.validateInputAndSet(this.isZip, this.props.donorInfo.zip, 'zipHelp', 'Please enter a valid zip code')
    ];

    if (!complete.includes(false)) {
      this.props.completeStage("info")

      Amplitude.setUserId(this.props.donorInfo.email);
      Amplitude.event('Information Provided', {information:this.props.donorInfo});
      
    }
  }

  previousClicked(e) {
    this.props.previousStage("info");
  }

  onChange(e) {
    this.props.handleChange(e.target.id, e.target.value)
  }

  render() {
    return ( <
      div className = { this.props.donationStage === 'info' ? '' : 'hidden' } >
      <
      form >
      <
      Row >
      <
      Col xs = { 6 } >
      <
      FieldGroup id = "firstName"
      label = "First Name"
      type = "text"
      placeholder = ""
      help = { this.state.firstNameHelp }
      onChange = { this.onChange }
      value = { this.props.firstName }
      /> <
      /Col> <
      Col xs = { 6 } >
      <
      FieldGroup id = "lastName"
      label = "Last Name"
      type = "text"
      placeholder = ""
      help = { this.state.lastNameHelp }
      onChange = { this.onChange }
      value = { this.props.lastName }
      /> <
      /Col> <
      /Row> <
      Row >
      <
      Col xs = { 12 } >
      <
      FieldGroup id = "email"
      label = "Email Address"
      type = "text"
      placeholder = ""
      help = { this.state.emailHelp }
      onChange = { this.onChange }
      value = { this.props.email }
      /> <
      /Col> <
      /Row> <
      Row >
      <
      Col xs = { 12 } >
      <
      FieldGroup id = "phone"
      label = "Phone Number"
      type = "text"
      placeholder = ""
      help = { this.state.phoneHelp }
      onChange = { this.onChange }
      value = { this.props.phone }
      /> <
      /Col> <
      /Row> <
      Row >
      <
      Col xs = { 12 } >
      <
      FieldGroup id = "address"
      label = "Street Address"
      type = "text"
      placeholder = ""
      help = { this.state.addressHelp }
      onChange = { this.onChange }
      value = { this.props.address }
      /> <
      /Col> <
      /Row> <
      Row >
      <
      Col xs = { 5 } >
      <
      FieldGroup id = "city"
      label = "City"
      type = "text"
      placeholder = ""
      help = { this.state.cityHelp }
      onChange = { this.onChange }
      value = { this.props.city }
      /> <
      /Col> <
      Col xs = { 3 } >
      <
      FieldGroupSelect id = "state"
      label = "State"
      options = { states }
      onChange = { this.onChange }
      value = { this.props.state }
      /> <
      /Col> <
      Col xs = { 4 } >
      <
      FieldGroup id = "zip"
      label = "Zip Code"
      type = "text"
      placeholder = ""
      help = { this.state.zipHelp }
      onChange = { this.onChange }
      value = { this.props.zip }
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
      Pager.Item previous = { true }
      onSelect = {
        (e) => this.previousClicked(e) } > < FontAwesome name = 'arrow-circle-left'
      size = 'lg' / > Previous < /Pager.Item> { ' ' } <
      Pager.Item next = { true }
      onSelect = {
        (e) => this.nextClicked(e) } > Next < FontAwesome name = 'arrow-circle-right'
      size = 'lg' / > < /Pager.Item> <
      /Pager> <
      /Col> <
      /Row> <
      /form> <
      /div>
    );
  }
}

export default InfoPanel;