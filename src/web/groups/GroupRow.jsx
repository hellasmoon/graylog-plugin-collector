import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import EditGroupModal from './EditGroupModal';
import CopyGroupModal from './CopyGroupModal';

import Routes from 'routing/Routes';

const GroupRow = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
    onCopy: React.PropTypes.func.isRequired,
    validateConfiguration: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

  _handleClick() {
    const configuration = this.props.configuration;
    if (window.confirm(`You are about to delete configuration "${configuration.name}". Are you sure?`)) {
      this.props.onDelete(configuration);
    }
  },

  render() {
    const configuration = this.props.configuration;
    const tagBadges = configuration.tags.map((tag) => {
      return <span className="badge configuration-tag" key={tag}>{tag}</span>;
    });

    return (
      <tr>
        <td className="name limited">
          <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS_ID')(configuration.id)}>
            <a>{configuration.name}</a>
          </LinkContainer>
        </td>
        <td>
          {tagBadges}
        </td>
        <td>
          <Button bsStyle="primary" bsSize="xsmall" onClick={this._handleClick}>
            Delete
          </Button>
          &nbsp;
          <CopyGroupModal id={this.props.configuration.id} validConfigurationName={this.props.validateConfiguration} copyConfiguration={this.props.onCopy} />
          &nbsp;
          <EditGroupModal configuration={this.props.configuration}
                                  updateConfiguration={this.props.onUpdate}
                                  validConfigurationName={this.props.validateConfiguration} />
        </td>
      </tr>
    );
  },
});

export default GroupRow;
