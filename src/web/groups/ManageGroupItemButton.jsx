import React from 'react';
import { Button } from 'react-bootstrap';
import GroupItemForm from './GroupItemForm';

const ManageGroupItemButton = React.createClass({
  propTypes: {
    buttonText: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
    onSaveStreamRule: React.PropTypes.func.isRequired,
    onDeleteStreamRule: React.PropTypes.func.isRequired,
    streamRules: React.PropTypes.array.isRequired,
  },
  getDefaultProps() {
    return {
      buttonText: 'Manage group item',
    };
  },
  onClick() {
    this.refs.groupItemForm.open();
    console.log("streamRuleId:",this.props.streamRule);
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
                        onDelete={this.props.onDeleteStreamRule}
                        streamRules={this.props.streamRules}
                        streamRuleTypes={this.props.streamRuleTypes} />
      </span>
    );
  },
});

export default ManageGroupItemButton;
