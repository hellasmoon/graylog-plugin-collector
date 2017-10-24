import React from 'react';

import MultiSelect from 'components/common/MultiSelect';

const IPSelect = React.createClass({
  propTypes: {
    tags: React.PropTypes.arrayOf(React.PropTypes.string),
    availableIPs: React.PropTypes.array.isRequired,
  },

  getDefaultProps() {
    return {
      ips: [],
    };
  },

  getValue() {
    return this.refs.select.getValue().split(',');
  },

  render() {
    const tagsValue = this.props.ips.join(',');
    const tagsOptions = this.props.availableIPs.map((ip) => {
      return { value: ip.name, label: ip.name };
    });
    return (
      <MultiSelect
        ref="select"
        options={tagsOptions}
        value={tagsValue}
        placeholder="Choose IPs..."
        allowCreate
      />
    );
  },
});

export default IPSelect;
