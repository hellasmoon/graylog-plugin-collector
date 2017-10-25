import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { IfPermitted } from 'components/common';
import GroupForm from './GroupForm';
import PermissionsMixin from 'util/PermissionsMixin';

import StoreProvider from 'injection/StoreProvider';
const StartpageStore = StoreProvider.getStore('Startpage');

const GroupControls = React.createClass({
  propTypes: {
    stream: React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired,
    indexSets: React.PropTypes.array.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onClone: React.PropTypes.func.isRequired,
    onQuickAdd: React.PropTypes.func.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
    isDefaultStream: React.PropTypes.bool,
  },
  mixins: [PermissionsMixin],
  getInitialState() {
    return {};
  },
  _onDelete(_, event) {
    event.preventDefault();
    this.props.onDelete(this.props.stream);
  },
  _onEdit(_, event) {
    event.preventDefault();
    this.refs.streamForm.open();
  },
  _onClone(_, event) {
    event.preventDefault();
    this.refs.cloneForm.open();
  },
  _onCloneSubmit(_, stream) {
    this.props.onClone(this.props.stream.id, stream);
  },
  _onQuickAdd(_, event) {
    event.preventDefault();
    this.props.onQuickAdd(this.props.stream.id);
  },
  _setStartpage(_, event) {
    event.preventDefault();
    StartpageStore.set(this.props.user.username, 'stream', this.props.stream.id);
  },
  render() {
    const stream = this.props.stream;

    return (
      <span>
        <DropdownButton title="More Actions" ref="dropdownButton" pullRight
                        id={`more-actions-dropdown-${stream.id}`} disabled={this.props.isDefaultStream}>
          <IfPermitted permissions={`streams:edit:${stream.id}`}>
            <MenuItem key={`editStreams-${stream.id}`} onSelect={this._onEdit}>Edit group</MenuItem>
          </IfPermitted>
          <IfPermitted permissions={`streams:edit:${stream.id}`}>
            <MenuItem key={`deleteStream-${stream.id}`} onSelect={this._onDelete}>
              Delete this group
            </MenuItem>
          </IfPermitted>
        </DropdownButton>
        <GroupForm ref="streamForm" title="Editing Group" onSubmit={this.props.onUpdate} stream={stream} indexSets={this.props.indexSets} />
      </span>
    );
  },
});

export default GroupControls;
