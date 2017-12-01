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
      return streamRules.sort(function (a,b) {
        if(a.value < b.value){
          return -1;
        }else {
          return 1;
        }
      }).map((streamRule) => {
        return (
          <GroupItem key={streamRule.id} value={streamRule.value} />
        );
      });
    }
    return <li>This group is empty, try click "Manage group item" button to add some IPs. Or go to App Center if configured.</li>;
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
