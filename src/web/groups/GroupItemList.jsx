import React from 'react';

import GroupItem from './GroupItem';
import { Spinner } from 'components/common';

const GroupItemList = React.createClass({
  propTypes: {
    matchData: React.PropTypes.object,
    onSubmit: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    permissions: React.PropTypes.array.isRequired,
    stream: React.PropTypes.object.isRequired,
    streamRuleTypes: React.PropTypes.array.isRequired,
  },

  _formatStreamRules(streamRules) {
    if (streamRules && streamRules.length > 0) {
      return streamRules.map((streamRule) => {
        return (
          <GroupItem key={streamRule.id} value={streamRule.value} />
        );
      });
    }
    return <li>This group is empty, try click "Manage group item" button to add some IPs.</li>;
  },
  render() {
    if (this.props.stream) {
      const streamRules = this._formatStreamRules(this.props.stream.rules);
      return (
        <ul className="streamrules-list">
          {streamRules}
        </ul>
      );
    }
    return (
      <Spinner />
    );
  },
});

export default GroupItemList;
