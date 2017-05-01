import React, { Component } from 'react';
import { Pager, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import 'whatwg-fetch'
import * as Braintree from 'braintree-web';
import logo from '../logo.svg';
import '../App.css';



class CreditPanel extends Component {
  
  constructor(props) {
    super(props);
    this.state = {clientToken:""}
    let hostedFields

    this.setupBraintree = this.setupBraintree.bind(this);
    this.clientDidCreate = this.clientDidCreate.bind(this);  
    this.hostedFieldsDidCreate = this.hostedFieldsDidCreate.bind(this); 
    this.previousClicked = this.previousClicked.bind(this);
    this.donateClicked = this.donateClicked.bind(this)
    this.nonceWasGenerated = this.nonceWasGenerated.bind(this);
  }
  
  setupBraintree(clientToken) {
    console.log(clientToken);
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
        console.log("BT: ");
        //console.log(response);
        return response.json()
      })
      .then((json)=>this.setupBraintree(json.btClientToken))
      .catch(function() {
      });
  }

  nonceWasGenerated(tokenizeErr, payload) {
    console.log("Nonce was gen'd")
    console.log(payload.nonce)
    console.log(this);

    this.props.processDonation(payload.nonce)
  }
  
  previousClicked(e) {
    this.props.previousStage("credit");
  }

  donateClicked(e) {
    console.log("Here i am clicked")
    console.log(this.hostedFields);
    this.hostedFields.tokenize((tokenizeErr, payload)=>this.nonceWasGenerated(tokenizeErr, payload));

}

  render() { 
    const buttonTextEnd = this.props.donationFrequency === 'one-time' ? "today" : "each month"
    const buttonText = 'Donate $' + this.props.donationAmount + ' ' + buttonTextEnd

    return (
      <div className={this.props.donationStage === 'credit' ? '' : 'hidden'}>
        <form>
          <Row>
            <Col xs={8}>
              <FormGroup>
                  <ControlLabel>Credit Card</ControlLabel>
                  <div id="card-number" className='form-control' />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <FormGroup>
                  <ControlLabel>Expiration Date</ControlLabel>
                  <div id="expiration-date" className='form-control' />
              </FormGroup>
            </Col>
            <Col xs={6}>
              <FormGroup>
                  <ControlLabel>Security Code</ControlLabel>
                  <div id="cvv" className='form-control' />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <FormGroup>
                  <ControlLabel>Zip Code</ControlLabel>
                  <div id="postal-code" className='form-control' />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={10} xsOffset={1}>
            <Pager>
              <Pager.Item previous={true} onSelect={(e) => this.previousClicked(e)}><FontAwesome name='arrow-circle-left' size='lg'/> Previous</Pager.Item>
                {' '}
              <Pager.Item next={true} onSelect={(e) => this.donateClicked(e)}>{buttonText} <FontAwesome name='arrow-circle-right' size='lg'/></Pager.Item>
            </Pager>
            </Col>
          </Row>
        </form>
      </div>
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