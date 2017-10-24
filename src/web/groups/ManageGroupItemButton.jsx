import React from 'react';
import { Button } from 'react-bootstrap';
import GroupItemForm from './GroupItemForm';

const ManageGroupItemButton = React.createClass({
  propTypes: {
    buttonText: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
    onSaveStreamRule: React.PropTypes.func.isRequired,
  },
  getDefaultProps() {
    return {
      buttonText: 'Manage group item',
    };
  },
  onClick() {
    this.refs.groupItemForm.open();
  },
  render() {
    return (
      <span>
        <Button bsStyle={this.props.bsStyle}
                onClick={this.onClick}>
          {this.props.buttonText}
        </Button>
        <GroupItemForm ref="groupItemForm" title="New Stream Rule"
                        onSubmit={this.props.onSaveStreamRule}
                        streamRuleTypes={this.props.streamRuleTypes} />
      </span>
    );
  },
});

export default ManageGroupItemButton;
