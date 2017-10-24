import React from 'react';
import Reflux from 'reflux';
import { Row, Col } from 'react-bootstrap';

import CreateGroupButton from './CreateGroupButton';
import GroupComponent from './GroupComponent';
import DocumentationLink from 'components/support/DocumentationLink';
import PageHeader from 'components/common/PageHeader';
import { DocumentTitle, IfPermitted, Spinner } from 'components/common';

import DocsHelper from 'util/DocsHelper';
import UserNotification from 'util/UserNotification';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
const StreamsStore = StoreProvider.getStore('Streams');
const IndexSetsStore = StoreProvider.getStore('IndexSets');

import ActionsProvider from 'injection/ActionsProvider';
const IndexSetsActions = ActionsProvider.getActions('IndexSets');

const GroupsPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(IndexSetsStore)],
  getInitialState() {
    return {
      indexSets: undefined,
    };
  },
  componentDidMount() {
    IndexSetsActions.list(false);
  },
  _isLoading() {
    return !this.state.currentUser || !this.state.indexSets;
  },
  _onSave(_, stream) {
    stream.title = "_Group:" + stream.title;
    console.log(stream);
    StreamsStore.save(stream, () => {
      UserNotification.success('Stream has been successfully created.', 'Success');
    });
  },
  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title="Groups">
        <div>
          <PageHeader title="Groups">
            <span>
              You can group incoming messages into groups by indicating group name and ip addresses.
              A group contains several ip addresses.
            </span>

            <span>
              Read more about groups in the <DocumentationLink page={DocsHelper.PAGES.STREAMS} text="documentation" />.
            </span>

            <IfPermitted permissions="streams:create">
              <CreateGroupButton ref="createStreamButton" bsSize="large" bsStyle="success" onSave={this._onSave}
                                  indexSets={this.state.indexSets} />
            </IfPermitted>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <GroupComponent currentUser={this.state.currentUser} onStreamSave={this._onSave}
                               indexSets={this.state.indexSets} />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default GroupsPage;
