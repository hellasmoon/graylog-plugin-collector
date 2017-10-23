import React from 'react';

import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';

import { DocumentTitle, PageHeader } from 'components/common';
import GroupList from './GroupsList';

import Routes from 'routing/Routes';

const ConfigurationsPage = React.createClass({
  render() {
    return (
      <DocumentTitle title="Log collector groups">
        <span>
          <PageHeader title="Log collector groups">
            <span>
              Log collector groups
            </span>

            <span>
              Read more about the collector sidecar in the{' '}
              <DocumentationLink page={DocsHelper.PAGES.COLLECTOR_SIDECAR} text="Graylog documentation" />.
            </span>

            <span>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_GROUPS')}>
                <Button bsStyle="info">Overview</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <GroupList />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default ConfigurationsPage;
