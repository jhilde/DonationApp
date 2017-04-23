import React, { Component } from 'react';
import { Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import 'whatwg-fetch'
import * as Braintree from 'braintree-web';
import logo from '../logo.svg';
import '../App.css';



class CreditPanel extends Component {
  
  constructor(props) {
    super(props);
    this.state = {clientToken:""}

    this.setupBraintree = this.setupBraintree.bind(this);
    this.clientDidCreate = this.clientDidCreate.bind(this);
  }
  
  setupBraintree(clientToken) {
    Braintree.client.create({
      authorization: clientToken
    }, this.clientDidCreate);
  }
  
  componentDidMount() {
      const url = 'https://ka1l8dezi6.execute-api.us-east-1.amazonaws.com/test/clientToken'

      fetch(url)
      .then(function(response) {
        return response.json()
      })
      .then((json)=>this.setupBraintree(json.clientToken))
      .catch(function() {
      });
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
          <Button bsClass={"btn btn-block btn-next"} onClick={(e) => this.nextClicked(e)}>
            {buttonText}
          </Button>
        </Row>
        </form>
      </div>
    )
  }

  hostedFieldsDidCreate(err, hostedFields) {
    
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