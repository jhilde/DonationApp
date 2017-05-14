import React, { Component } from 'react';
import { Well, Pager, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import { BTFieldGroup } from './Helpers'
import 'whatwg-fetch'
import * as Braintree from 'braintree-web';
import logo from '../logo.svg';
import Amplitude from 'react-amplitude';
import '../App.css';



class CreditPanel extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      clientToken: "",
      cvvHelp: "",
      creditCardHelp: "",
      postalCodeHelp: "",
      expirationDateHelp: ""
    }
    
    let hostedFields

    this.setupBraintree = this.setupBraintree.bind(this);
    this.clientDidCreate = this.clientDidCreate.bind(this);
    this.hostedFieldsDidCreate = this.hostedFieldsDidCreate.bind(this);
    this.previousClicked = this.previousClicked.bind(this);
    this.donateClicked = this.donateClicked.bind(this)
  }

  setupBraintree(clientToken) {
    Braintree.client.create({
      authorization: clientToken
    }, this.clientDidCreate);
  }

  componentDidMount() {
    const url = 'https://plhky3gted.execute-api.us-east-1.amazonaws.com/dev/clientToken'
    fetch(url, {
        method: 'post'
      })
      .then(function(response) {
        return response.json()
      })
      .then((json) => this.setupBraintree(json.btClientToken))
      .catch(function(error) {
        Amplitude.event('BT Error', {error:error});
        // What should we do here? Switch to a we're down screen?
      });
  }

  

  previousClicked(e) {
    this.props.previousStage("credit");
  }

  checkFieldAndLogError(field, helpName, errorText) {
    const valid = field.isValid;
    
    if(valid) {
      this.setState({
        [helpName]: ''});
    }
    else {
      this.setState({
        [helpName]: errorText});
    }
    
    return valid;
  }
  
  donateClicked(e) {
    const fields = this.hostedFields.getState().fields;

    const valid = [
      this.checkFieldAndLogError(fields['cvv'], 'cvvHelp', 'Please enter a valid cvv'),
      this.checkFieldAndLogError(fields['number'], 'cardNumberHelp', 'Please enter a valid credit card number'),
      this.checkFieldAndLogError(fields['expirationDate'], 'expirationDateHelp', 'Please enter a valid expiration date'),
      this.checkFieldAndLogError(fields['postalCode'], 'postalCodeHelp', 'Please enter a valid zip code')
    ];

    if (!valid.includes(false)) {
      this.hostedFields.tokenize((tokenizeErr, payload) => this.props.nonceWasGenerated(tokenizeErr, payload));
    }
    else {
      window.scrollTo(0,0);
    }
  }

  render() {
    const buttonTextEnd = this.props.donationFrequency === 'one-time' ? "today" : "each month"
    const buttonText = 'Donate $' + this.props.donationAmount + ' ' + buttonTextEnd

    return ( 
    
    <div className = { this.props.donationStage === 'credit' ? '' : 'hidden' } >
      <Well className = { this.props.processorErrors ? '' : 'hidden' }>
        < FontAwesome name = 'exclamation-triangle' size = 'lg' style={{color:'#FF0000'}} />
        &nbsp;&nbsp;There were some errors processing your credit card. Our credit card processor returned: 
        <i><strong> {this.props.processorErrorMessage} </strong></i>
        Please correct any errors and try again.
      </Well>
      <form>
        <Row>
          <Col xs = { 8 } >
            <FormGroup>
              <BTFieldGroup
                id="card-number"
                label="Credit Card"
                help = { this.state.cardNumberHelp }
                className = 'form-control'
              />
            </FormGroup> 
          </Col> 
        </Row> 
        <Row>
          <Col xs = { 6 } >
            <FormGroup>
              <BTFieldGroup
                id="expiration-date"
                label="Expiration Date"
                help = { this.state.expirationDateHelp }
                className = 'form-control'
              />
            </FormGroup> 
          </Col> 
          <Col xs = { 6 } >
            <FormGroup>
              <BTFieldGroup
                id="cvv"
                label="Security Code"
                help = { this.state.cvvHelp }
                className = 'form-control'
              />
            </FormGroup> 
          </Col> 
        </Row> 
        <Row>
          <Col xs = { 6 } >
            <FormGroup>
              <BTFieldGroup
                id="postal-code"
                label="Zip Code"
                help = { this.state.postalCodeHelp }
                className = 'form-control'
              />
            </FormGroup> 
          </Col> 
        </Row> 
        <Row>
          <Col xs = { 10 } xsOffset = { 1 } >
            <Pager >
              <Pager.Item previous = { true } onSelect = {(e) => this.previousClicked(e)}> 
                <FontAwesome name = 'arrow-circle-left' size = 'lg' />
                Previous 
              </Pager.Item> { ' ' } 
              <Pager.Item next = { true } onSelect = {(e) => this.donateClicked(e)}> 
                { buttonText } 
                < FontAwesome name = 'arrow-circle-right' size = 'lg' /> 
              </Pager.Item> 
            </Pager> 
          </Col> 
        </Row> 
      </form> 
    </div >
    )
  }

  hostedFieldsDidCreate(err, hostedFields) {
    this.hostedFields = hostedFields;
  }

  clientDidCreate(err, client) {
    Braintree.hostedFields.create({
      client: client,
      styles: {
        'input': {
          'font-size': '14pt'
        },
        'input.invalid': {
          'color': 'red'
        },
        'input.valid': {
          'color': 'green'
        }
      },
      fields: {
        number: {
          selector: '#card-number',
          placeholder: '4111 1111 1111 1111'
        },
        cvv: {
          selector: '#cvv',
          placeholder: '123'
        },
        expirationDate: {
          selector: '#expiration-date',
          placeholder: '02/20'
        },
        postalCode: {
          selector: '#postal-code',
          placeholder: '02145'
        }
      }
    }, this.hostedFieldsDidCreate);
  }

}

export default CreditPanel;