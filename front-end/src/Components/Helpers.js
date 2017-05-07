import React, { Component } from 'react';
import { Row, Button, Col, Panel, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'


function DonationAmountButton(props) {
  return ( 
    <Col xs={4}>
      <Button bsClass={"btn btn-block btn-amount btn-pill"} onClick={props.onClick}>${props.amount}</Button>          
    </Col>
  )
}

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl id={id} {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

function BTFieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <div id={id} {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

function FieldGroupSelect({id, label, help, options, ...props }) {
    return (
      <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <FormControl id={id} componentClass='select' {...props}>
            {options.map((option) =>
              <option value={option} key={option}>{option}</option>
            )}
        </FormControl>
        {help && <HelpBlock>{help}</HelpBlock>}
      </FormGroup>
    );
}

    <FormGroup controlId="formControlsSelect">
      <ControlLabel>Select</ControlLabel>
      <FormControl componentClass="select" placeholder="select">
        <option value="select">select</option>
        <option value="other">...</option>
      </FormControl>
    </FormGroup>

function isCurrency(input) {
    const re = /^([1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|\.[0-9]{1,2})$/
    return re.test(input)
}

export { DonationAmountButton, FieldGroup, FieldGroupSelect, BTFieldGroup, isCurrency }