import React from 'react';

const GroupItem = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
  },

  render() {
    const value = this.props.value;
    return (
      <li>
        <span>{value}</span>
      </li>
    );
  },
});

export default GroupItem;
