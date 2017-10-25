import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch, { fetchPeriodically } from 'logic/rest/FetchProvider';

import GroupsActions from './GroupsActions';

const GroupsStore = Reflux.createStore({
  listenables: [GroupsActions],
  sourceUrl: '/plugins/org.graylog.plugins.collector/collectors',
  ips: undefined,

  getCollectorIps() {
    const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/ips`));
    promise
      .then(
        response => {
          const availableIPs = [];
          for (let i = 0; i < response.length; i++){
            let ip = response[i].node_details.ip;
            availableIPs.push({name:ip});
          }
          this.ips = availableIPs;
          this.trigger({ ips: this.ips });

          return this.ips;
        },
        error => {
          UserNotification.error(`Fetching Collector ip list failed with status: ${error}`,
            'Could not retrieve Collector ip list');
        });
    GroupsActions.getCollectorIps.promise(promise);
  },

});

export default GroupsStore;
