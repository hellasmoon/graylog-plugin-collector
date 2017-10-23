import React from 'react';
import Reflux from 'reflux';

import { DataTable, Spinner } from 'components/common';

import CollectorGroupsStore from './CollectorGroupsStore';
import GroupRow from './GroupRow';
import CollectorGroupsActions from './CollectorGroupsActions';
import EditGroupModal from './EditGroupModal';

const GroupList = React.createClass({
  mixins: [Reflux.connect(CollectorGroupsStore)],

  componentDidMount() {
    this.style.use();
    this._reloadConfiguration();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

  _reloadConfiguration() {
    CollectorGroupsActions.list.triggerPromise().then((configurations) => {
      const tags = configurations
        .map(configuration => configuration.tags)
        .reduce((uniqueTags, currentTags) => {
          currentTags.forEach(tag => {
            if (uniqueTags.indexOf(tag) === -1) {
              uniqueTags.push(tag);
            }
          });

          return uniqueTags;
        }, []);
      this.setState({ tags });
    });
  },

  _validConfigurationName(name) {
    // Check if configurations already contain a configuration with the given name.
    return !this.state.configurations.some((configuration) => configuration.name === name);
  },

  _createConfiguration(configuration, callback) {
    CollectorGroupsActions.createConfiguration.triggerPromise(configuration.name)
      .then(() => {
        callback();
        this._reloadConfiguration();
      });
  },

  _updateConfiguration(configuration, callback) {
    CollectorGroupsActions.updateConfiguration.triggerPromise(configuration)
      .then(() => {
        callback();
        this._reloadConfiguration();
      });
  },

  _copyConfiguration(configuration, name, callback) {
    CollectorGroupsActions.copyConfiguration.triggerPromise(configuration, name)
      .then(() => {
        callback();
        this._reloadConfiguration();
      });
  },

  _onDelete(configuration) {
    CollectorGroupsActions.delete.triggerPromise(configuration)
      .then(() => {
        this._reloadConfiguration();
      });
  },

  _headerCellFormatter(header) {
    const className = (header === 'Actions' ? 'actions' : '');
    return <th className={className}>{header}</th>;
  },

  _collectorConfigurationFormatter(configuration) {
    return (
      <GroupRow key={configuration.id} configuration={configuration} onUpdate={this._updateConfiguration}
                        onCopy={this._copyConfiguration} validateConfiguration={this._validConfigurationName}
                        onDelete={this._onDelete} />
    );
  },

  _isLoading() {
    return !this.state.configurations;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const headers = ['Configuration', 'Tags', 'Actions'];
    const filterKeys = ['name', 'id'];

    return (
      <div>
        <DataTable id="collector-configurations-list"
                   className="table-hover"
                   headers={headers}
                   headerCellFormatter={this._headerCellFormatter}
                   sortByKey="name"
                   rows={this.state.configurations}
                   filterBy="tag"
                   filterSuggestions={this.state.tags}
                   dataRowFormatter={this._collectorConfigurationFormatter}
                   filterLabel="Filter Configurations"
                   noDataText="There are no configurations to display, why don't you create one?"
                   filterKeys={filterKeys}>
          <div className="pull-right">
            <EditGroupModal create updateConfiguration={this._createConfiguration}
                                    validConfigurationName={this._validConfigurationName}/>
          </div>
        </DataTable>
      </div>
    );
  },
});

export default GroupList;
