import React from 'react';
import { Alert, Collapse } from 'react-bootstrap';

import GroupItemList from './GroupItemList';

const CollapsibleGroupItemList = React.createClass({
  propTypes: {
    permissions: React.PropTypes.array.isRequired,
    stream: React.PropTypes.object.isRequired,
    streamRuleTypes: React.PropTypes.array.isRequired,
  },
  getInitialState() {
    return {
      expanded: false,
    };
  },
  _onHandleToggle(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  },
  render() {
    const text = this.state.expanded ? 'Hide' : 'Show';

    return (
      <span className="stream-rules-link">
        <a href="#" onClick={this._onHandleToggle}>{text} IPs in this group</a>
        <Collapse in={this.state.expanded} timeout={0}>
          <Alert ref="well">
            <GroupItemList stream={this.props.stream}
                            streamRuleTypes={this.props.streamRuleTypes}
                            permissions={this.props.permissions} />
          </Alert>
        </Collapse>
      </span>
    );
  },
});

export default CollapsibleGroupItemList;
