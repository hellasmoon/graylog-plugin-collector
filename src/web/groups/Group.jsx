import React, { PropTypes } from 'react';
import StreamThroughput from 'components/streams/StreamThroughput';
import GroupControls from './GroupControls';
import StreamStateBadge from 'components/streams/StreamStateBadge';
import CollapsibleStreamRuleList from './CollapsibleGroupItemList';
import PermissionsMixin from 'util/PermissionsMixin';

import StoreProvider from 'injection/StoreProvider';
const StreamsStore = StoreProvider.getStore('Streams');
const StreamRulesStore = StoreProvider.getStore('StreamRules');

import StreamRuleForm from 'components/streamrules/StreamRuleForm';
import { OverlayElement, Pluralize } from 'components/common';
import UserNotification from 'util/UserNotification';
import { Button, Tooltip } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Routes from 'routing/Routes';

import ManageGroupItemButton from './ManageGroupItemButton';

import style from 'components/streams/Stream.css';

const Group = React.createClass({
  propTypes() {
    return {
      stream: PropTypes.object.isRequired,
      permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
      streamRuleTypes: PropTypes.array.isRequired,
      user: PropTypes.object.isRequired,
      indexSets: React.PropTypes.array.isRequired,
      enableAppCenter: React.PropTypes.bool.isRequired,
    };
  },
  mixins: [PermissionsMixin],

  getInitialState() {
    return {
      loading: false,
    };
  },

  _formatNumberOfStreamRules(stream) {
    if (stream.is_default) {
      return 'The default stream contains all messages.';
    }
    if (stream.rules.length === 0) {
      return 'No configured rules.';
    }

    let verbalMatchingType;
    switch (stream.matching_type) {
      case 'OR': verbalMatchingType = 'at least one'; break;
      default:
      case 'AND': verbalMatchingType = 'all'; break;
    }

    return (
      <span>
        Must from {verbalMatchingType} of the {stream.rules.length} IPs{' '}
        <Pluralize value={stream.rules.length} plural="rules" singular="rule" />.
      </span>
    );
  },
  _onDelete(stream) {
    if (window.confirm('Do you really want to remove this group?')) {
      StreamsStore.remove(stream.id, (response) => {
        UserNotification.success(`Group '${stream.title_shadow}' was deleted successfully.`, 'Success');
        return response;
      });
    }
  },
  _onResume() {
    this.setState({ loading: true });
    StreamsStore.resume(this.props.stream.id, response => response)
      .finally(() => this.setState({ loading: false }));
  },
  _onUpdate(streamId, stream) {
    StreamsStore.update(streamId, stream, (response) => {
      UserNotification.success(`Group '${stream.title_shadow}' was updated successfully.`, 'Success');
      return response;
    });
  },
  _onClone(streamId, stream) {
    StreamsStore.cloneStream(streamId, stream, (response) => {
      UserNotification.success(`Group was successfully cloned as '${stream.title_shadow}'.`, 'Success');
      return response;
    });
  },
  _onPause() {
    if (window.confirm(`Do you really want to pause group '${this.props.stream.title_shadow}'?`)) {
      this.setState({ loading: true });
      StreamsStore.pause(this.props.stream.id, response => response)
        .finally(() => this.setState({ loading: false }));
    }
  },
  _onQuickAdd() {
    this.refs.quickAddStreamRuleForm.open();
  },
  _onSaveStreamRule(streamRuleId, streamRule) {
    StreamRulesStore.create(this.props.stream.id, streamRule, () => UserNotification.success('Group item was created successfully.', 'Success'));
  },
  _onDeleteStreamRulesByStreamId() {
    StreamRulesStore.removeAll(this.props.stream.id, () => UserNotification.success('Group items was deleted successfully.', 'Success'));
  },
  _onDeleteStreamRulesByStreamRuleId(streamRuleId) {
    StreamRulesStore.remove(this.props.stream.id, streamRuleId, () => UserNotification.success('Group items was deleted successfully.', 'Success'));
  },

  render() {
    const stream = this.props.stream;
    const permissions = this.props.permissions;
    const streamRules = this.props.stream.rules;

    const isDefaultStream = stream.is_default;
    const defaultStreamTooltip = isDefaultStream ?
      <Tooltip id="default-stream-tooltip">Action not available for the default stream</Tooltip> : null;

    let editRulesLink;
    let manageOutputsLink;
    let manageAlertsLink;
    if (this.isPermitted(permissions, [`streams:edit:${stream.id}`])) {
      if (this.props.enableAppCenter){
        editRulesLink = (undefined);
      }else {
        editRulesLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
            <ManageGroupItemButton ref="manageGroupItemButton" bsStyle="info"
                                   onSaveStreamRule={this._onSaveStreamRule}
                                   onDeleteStreamRule={this._onDeleteStreamRulesByStreamRuleId}
                                   streamRules={streamRules}
                                   streamRuleTypes={this.props.streamRuleTypes}/>
          </OverlayElement>
        );
      }

      if (this.isPermitted(permissions, ['stream_outputs:read'])) {
        manageOutputsLink = (
          <LinkContainer to={Routes.stream_outputs(stream.id)}>
            <Button bsStyle="info">Manage Outputs</Button>
          </LinkContainer>
        );
      }
    }

    let toggleStreamLink;
    if (this.isAnyPermitted(permissions, [`streams:changestate:${stream.id}`, `streams:edit:${stream.id}`])) {
      if (stream.disabled) {
        toggleStreamLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
            <Button bsStyle="success" className="toggle-stream-button" onClick={this._onResume}
                    disabled={isDefaultStream || this.state.loading}>
              {this.state.loading ? 'Starting...' : 'Start Group'}
            </Button>
          </OverlayElement>
        );
      } else {
        toggleStreamLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
            <Button bsStyle="primary" className="toggle-stream-button" onClick={this._onPause}
                    disabled={isDefaultStream || this.state.loading}>
              {this.state.loading ? 'Pausing...' : 'Pause Group'}
            </Button>
          </OverlayElement>
        );
      }
    }

    const createdFromContentPack = (stream.content_pack ?
      <i className="fa fa-cube" title="Created from content pack" /> : null);

    const streamRuleList = isDefaultStream ? null :
                           (<CollapsibleStreamRuleList key={`streamRules-${stream.id}`}
                                 stream={stream}
                                 streamRuleTypes={this.props.streamRuleTypes}
                                 permissions={this.props.permissions} />);
    let streamControls;
    if (this.props.enableAppCenter){
      streamControls = (undefined);
    }else {
      streamControls = (
        <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
          <GroupControls stream={stream} permissions={this.props.permissions}
                         user={this.props.user}
                         onDelete={this._onDelete} onUpdate={this._onUpdate}
                         onClone={this._onClone}
                         onQuickAdd={this._onQuickAdd}
                         indexSets={this.props.indexSets}
                         isDefaultStream={isDefaultStream} />
        </OverlayElement>
      );
    }

    const indexSet = this.props.indexSets.find(is => is.id === stream.index_set_id) || this.props.indexSets.find(is => is.is_default);
    const indexSetDetails = this.isPermitted(permissions, ['indexsets:read']) && indexSet ? <span>index set <em>{indexSet.title}</em> &nbsp;</span> : null;

    return (
      <li className="stream">
        <div className="stream-actions pull-right">
          {editRulesLink}{' '}
          {manageOutputsLink}{' '}
          {toggleStreamLink}{' '}

          {streamControls}
        </div>

        <h2 className={style.streamTitle}>
          <LinkContainer to={Routes.stream_search(stream.id)}>
            <a>{stream.title_shadow}</a>
          </LinkContainer>
          {' '}
          <small>{indexSetDetails}<StreamStateBadge stream={stream} /></small>
        </h2>

        <div className="stream-data">
          <div className="stream-description">
            {createdFromContentPack}

            {stream.description}
          </div>
          <div className="stream-metadata">
            <StreamThroughput streamId={stream.id} />. {this._formatNumberOfStreamRules(stream)}
            {streamRuleList}
          </div>
        </div>
        <StreamRuleForm ref="quickAddStreamRuleForm" title="New Stream Rule"
                        onSubmit={this._onSaveStreamRule}
                        streamRuleTypes={this.props.streamRuleTypes} />
      </li>
    );
  },
});

export default Group;
