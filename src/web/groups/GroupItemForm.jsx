import React from 'react';
import { Col } from 'react-bootstrap';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import { Input } from 'components/bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { TypeAheadFieldInput } from 'components/common';
import { DocumentationLink } from 'components/support';

import IPSelect from './IPSelect'


const GroupItemForm = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    streamRule: React.PropTypes.object,
    streamRuleTypes: React.PropTypes.array.isRequired,
    title: React.PropTypes.string.isRequired,
    streamRules: React.PropTypes.array.isRequired,
  },
  mixins: [LinkedStateMixin],
  getDefaultProps() {
    return {
      streamRule: { field: '', type: 1, value: '', inverted: false, description: '' },
    };
  },
  getInitialState() {
    return this.props.streamRule;
  },
  FIELD_PRESENCE_RULE_TYPE: 5,
  ALWAYS_MATCH_RULE_TYPE: 7,
  _resetValues() {
    this.setState(this.props.streamRule);
  },
  _onSubmit() {
    this.props.onDelete();
    this.state.field = "HOSTIP";
    const ips = this.refs.ips.getValue().filter((value) => value !== '');
    for (let i = 0; i < ips.length; i++){
      this.state.value = ips[i];
      this.state.type = 1;
      this.props.onSubmit(this.props.streamRule.id, this.state);
    }
    this.refs.modal.close();
  },
  _formatStreamRuleType(streamRuleType) {
    return (
      <option key={`streamRuleType${streamRuleType.id}`}
              value={streamRuleType.id}>{streamRuleType.short_desc}</option>
    );
  },
  open() {
    this._resetValues();
    this.refs.modal.open();
  },
  close() {
    this.refs.modal.close();
  },
  render() {
    const streamRules = this.props.streamRules;
    const availableTags = [{name:"1.1.1.1"},{name:"2.2.2.2"},{name:"3.3.3.3"},{name:"3.3.3.4"},{name:"3.3.3.5"},{name:"3.3.3.6"},{name:"3.3.3.7"},{name:"3.3.3.8"}];
    const tags = [];

    for (let i = 0; i < streamRules.length; i++){
      tags.push(streamRules[i].value);
    }

    return (
      <BootstrapModalForm ref="modal"
                          title={this.props.title}
                          onSubmitForm={this._onSubmit}
                          submitButtonText="Save"
                          formProps={{id: 'StreamRuleForm'}}>
        <div>
          <Col md={12}>
            <Input label="Group Items"
                   help="Select ip addresses belong to this group">
              <IPSelect ref="ips" availableIPs={availableTags} ips={tags}
                          className="form-control" />
            </Input>
          </Col>
        </div>
      </BootstrapModalForm>
    );
  },
});

export default GroupItemForm;
