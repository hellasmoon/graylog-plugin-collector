import React from 'react';
import { Button } from 'react-bootstrap';
import GroupForm from './GroupForm';

const CreateGroupButton = React.createClass({
  propTypes: {
    buttonText: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
    bsSize: React.PropTypes.string,
    className: React.PropTypes.string,
    onSave: React.PropTypes.func.isRequired,
    indexSets: React.PropTypes.array.isRequired,
  },
  getDefaultProps() {
    return {
      buttonText: 'Create Group',
    };
  },
  onClick() {
    this.refs.groupForm.open();
  },
  render() {
    return (
      <span>
        <Button bsSize={this.props.bsSize} bsStyle={this.props.bsStyle} className={this.props.className}
                onClick={this.onClick}>
          {this.props.buttonText}
        </Button>
        <GroupForm ref="groupForm" title="Creating Group" indexSets={this.props.indexSets}
                    onSubmit={this.props.onSave} />
      </span>
    );
  },
});

export default CreateGroupButton;
