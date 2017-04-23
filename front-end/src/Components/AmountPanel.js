import React, { Component } from 'react';
import { Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import { DonationAmountButton, FieldGroup, isCurrency } from './Helpers';
//import { isCurrency } from 'validator';

import '../App.css';


class AmountPanel extends Component {
  constructor(props) {
    super(props)
    this.state = { otherDonationAmount: '' }
    
    this.otherAmountChanged = this.otherAmountChanged.bind(this)
  }

  frequencyClicked(which, e) {
    this.props.updateFrequency(which);
  }

  amountClicked(amount, e) {
    this.props.updateAmount(amount);
    this.props.completeStage("amount")
  }

  otherAmountChanged(e) {
    if(isCurrency(e.target.value) || e.target.value=='') {
        this.setState({otherDonationAmount: e.target.value})
    }
  }

  nextClicked(e) {
    this.props.updateAmount(this.state.otherDonationAmount);
    this.props.completeStage("amount");
}



  render() {
    return (
      <div className={this.props.donationStage === 'amount' ? '' : 'hidden'}>
          <Row>
            <Button bsClass={this.props.donationFrequency === 'one-time' ? 'btn btn-link active' : 'btn btn-link'} onClick={(e) => this.frequencyClicked("one-time", e)}>One-time</Button>
            <Button bsClass={this.props.donationFrequency === 'monthly' ? 'btn btn-link active' : 'btn btn-link'} onClick={(e) => this.frequencyClicked("monthly", e)}>Monthly</Button>
          </Row>
        <Row>
            <DonationAmountButton amount={50} onClick={(e) => this.amountClicked(50,e)}/>
            <DonationAmountButton amount={100} onClick={(e) => this.amountClicked(100,e)}/>
            <DonationAmountButton amount={200} onClick={(e) => this.amountClicked(200,e)}/>
        </Row>
        <Row>
            <DonationAmountButton amount={500} onClick={(e) => this.amountClicked(500,e)}/>
            <DonationAmountButton amount={1000} onClick={(e) => this.amountClicked(1000,e)}/>
            <DonationAmountButton amount={2000} onClick={(e) => this.amountClicked(2000,e)}/>
        </Row>
        <Row>
            <DonationAmountButton amount={2500} onClick={(e) => this.amountClicked(2500,e)}/>
            <Col xs={8}>
              <FieldGroup
                id="otherAmount"
                type="text"
                placeholder="Other Amount"
                value={this.state.otherDonationAmount}
                onChange={this.otherAmountChanged}
              />
            </Col>
        </Row>
        <Row>
          <Button bsClass={"btn btn-block btn-next"} onClick={(e) => this.nextClicked(e)}>
            Next <FontAwesome name='arrow-right' size='2x'/>
          </Button>
        </Row>
    </div>
    );
  }
}

export default AmountPanel;

