import React from 'react';
import { Alert, Collapse, Panel } from 'react-bootstrap';
import { Input } from 'components/bootstrap';

const CollapsibleVerbatim = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    let expanded = false;
    // if (this.props.value) {
    //   expanded = true;
    // }
    return {
      expanded: expanded,
    };
  },

  _onHandleToggle(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  },

  _getId(prefixIdName) {
    return prefixIdName + this.props.type;
  },

  render() {
    const text = this.state.expanded ? 'Hide' : 'Add';

    return (
      <span className="verbatim-configuration">
        <a href="#" onClick={this._onHandleToggle}>{text} verbatim configuration</a>
        <Collapse in={this.state.expanded} timeout={0}>
          <Alert ref="well">
                {/*<Panel bsStyle="danger" header="Attention! Please don't remove the 'Exec' statements !!!">*/}
                  {/*Auto-generated Exec statements such as "Exec $HOSTIP = string(host_ip());" are very important statements which allow collectors to report their ip address*/}
                  {/*or file name as a field. So DO NOT remove them.*/}
                  {/*Add your own verbatim configurations after them.*/}
                {/*</Panel>*/}
                <Input type="textarea"
                       id={this._getId('verbatim')}
                       label="Add verbatim configuration"
                       value={this.props.value}
                       onChange={this.props.onChange('verbatim')}
                       disabled
                />
          </Alert>
        </Collapse>
      </span>
    );
  },
});

export default CollapsibleVerbatim;
