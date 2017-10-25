import Reflux from 'reflux';

const GroupsActions = Reflux.createActions({
  getCollectorIps: { asyncResult: true },
});

export default GroupsActions;
