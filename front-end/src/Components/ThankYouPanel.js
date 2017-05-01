import React, { Component } from 'react';
import { Well, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import '../App.css';

class ThankYouPanel extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className={this.props.donationStage === 'thank-you' ? '' : 'hidden'}>
        <Row>
          <Col xs={12}>
            <h2>Thank you for your donation</h2>
            <p>Thank you very much for your generous gift to Connexion on behalf of Freedom Connexion. We truly value your support for the work we do to provide a safe, fun, enriching environment for children during the summer.</p> 
            <p>This receipt certifies that you have made this donation as a charitable contribution and that you are not receiving any goods or services in return. Your donation of ${this.props.donationAmount} is tax deductible to the extent allowed by law.</p>
            <br/>
            <p>Justin Hildebrandt</p>
            <p>Executive Director, Freedom Connexion</p>
            <br/>
            <p>Transaction ID: {this.props.transactionId}</p>
            <p>Subscription ID: {this.props.subscriptionId}</p>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ThankYouPanel;