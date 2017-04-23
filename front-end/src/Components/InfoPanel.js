import React, { Component } from 'react';
import { Well, Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import { FieldGroup, FieldGroupSelect } from './Helpers'
import '../App.css';

const states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

class InfoPanel extends Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this);
  }

  nextClicked(e) {
    this.props.completeStage("info");
}

  onChange(e) {
    this.props.handleChange(e.target.id, e.target.value)
  }

  render() {
    return (
     <div className={this.props.donationStage === 'info' ? '' : 'hidden'}>
        <form>
          <Row>
            <Col xs={6}>
              <FieldGroup
                id="firstName"
                label="First Name"
                type="text"
                placeholder=""
                onChange={this.onChange}
                value={this.props.firstName}
              />
            </Col>
            <Col xs={6}>
              <FieldGroup
                id="lastName"
                label="Last Name"
                type="text"
                placeholder=""
                onChange={this.onChange}
                value={this.props.lastName}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <FieldGroup
                id="email"
                label="Email Address"
                type="text"
                placeholder=""
                onChange={this.onChange}
                value={this.props.email}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <FieldGroup
                id="address"
                label="Street Address"
                type="text"
                placeholder=""
                onChange={this.onChange}
                value={this.props.address}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <FieldGroup
                id="city"
                label="City"
                type="text"
                placeholder=""
                onChange={this.onChange}
                value={this.props.city}
              />
            </Col>
            <Col xs={3}>
              <FieldGroupSelect
                id="state"
                label="State"
                options={states}
                onChange={this.onChange}
                value={this.props.state}
              />
            </Col>
            <Col xs={3}>
              <FieldGroup
                id="zip"
                label="Zip Code"
                type="text"
                placeholder=""
                onChange={this.onChange}
                value={this.props.zip}
              />
            </Col>
          </Row>
        <Row>
          <Button bsClass={"btn btn-block btn-next"} onClick={(e) => this.nextClicked(e)}>
            Next <FontAwesome name='arrow-right' size='2x'/>
          </Button>
        </Row>
        </form>
      </div>
    );
  }
}

export default InfoPanel;