import {Store} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import CompositeState from '../structs/CompositeState';
var Config = require('../config/Config');
import {
  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR
} from '../constants/EventTypes';
var GetSetMixin = require('../mixins/GetSetMixin');
var MesosSummaryUtil = require('../utils/MesosSummaryUtil');
var MesosSummaryActions = require('../events/MesosSummaryActions');
import SummaryList from '../structs/SummaryList';
import StateSummary from '../structs/StateSummary';
var TimeScales = require('../constants/TimeScales');
import VisibilityStore from './VisibilityStore';

let requestInterval = null;
let isInactive = false;

function startPolling() {
  if (requestInterval == null && MesosSummaryStore.shouldPoll()) {
    // Should always retrieve bulk summary when polling starts
    MesosSummaryActions.fetchSummary(TimeScales.MINUTE);

    requestInterval = setInterval(function () {
      let wasInactive = isInactive && !VisibilityStore.get('isInactive');
      isInactive = VisibilityStore.get('isInactive');

      if (!isInactive) {
        if (wasInactive) {
          // Flush history with new data set
          MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
        } else {
          MesosSummaryActions.fetchSummary();
        }
      } else {
        // If not active, push null placeholder. This will ensure we maintain
        // history when navigating back, for case where history server is down.

        // Use {silent: true} Because we only want to push a summary on the stack without side
        // effects (like re-rendering etc). The tab is out of focus so we
        // don't want it to do any work. It only matters that there is
        // appropriate history when we return focus to the tab.
        MesosSummaryStore.processSummaryError({silent: true});
      }
    }, Config.getRefreshRate());
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
}

var MesosSummaryStore = Store.createStore({
  storeID: 'summary',

  mixins: [GetSetMixin],

  init: function () {
    if (this.get('initCalledAt') != null) {
      return;
    }

    this.set({
      initCalledAt: Date.now(), // log when we started calling
      loading: null,
      states: this.getInitialStates(),
      prevMesosStatusesMap: {},
      statesProcessed: false
    });

    startPolling();
  },

  getInitialStates: function () {
    let initialStates = MesosSummaryUtil.getInitialStates().slice();
    let states = new SummaryList({maxLength: Config.historyLength});
    initialStates.forEach(state => {
      states.addSnapshot(state, state.date, false);
    });

    return states;
  },

  unmount: function () {
    this.set({
      initCalledAt: null,
      loading: null,
      states: this.getInitialStates(),
      prevMesosStatusesMap: {},
      statesProcessed: false
    });

    stopPolling();
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);

    startPolling();
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  },

  shouldPoll: function () {
    return !!this.listeners(MESOS_SUMMARY_CHANGE).length;
  },

  getActiveServices: function () {
    return this.get('states').lastSuccessful().getServiceList().getItems();
  },

  getServiceFromName: function (name) {
    let services = this.getActiveServices();

    return services.find(function (service) {
      return service.get('name') === name;
    });
  },

  hasServiceUrl: function (serviceName) {
    let service = MesosSummaryStore.getServiceFromName(serviceName);
    let webuiUrl = service.get('webui_url');

    return service && !!webuiUrl && webuiUrl.length > 0;
  },

  updateStateProcessed: function () {
    this.set({statesProcessed: true});
    this.emit(MESOS_SUMMARY_CHANGE);
  },

  notifySummaryProcessed: function () {
    var initCalledAt = this.get('initCalledAt');
    // skip if state is processed, already loading or init has not been called
    if (this.get('statesProcessed') ||
        this.get('loading') != null ||
        initCalledAt == null) {
      this.emit(MESOS_SUMMARY_CHANGE);
      return;
    }

    var msLeftOfDelay = Config.stateLoadDelay - (Date.now() - initCalledAt);

    if (msLeftOfDelay < 0) {
      this.updateStateProcessed();
    } else {
      this.set({
        loading: setTimeout(
          this.updateStateProcessed.bind(this),
          msLeftOfDelay
        )
      });
    }
  },

  processSummary: function (data, options = {}) {
    // If request to Mesos times out we get an empty Object
    if (!Object.keys(data).length) {
      return this.processSummaryError();
    }

    let states = this.get('states');

    if (typeof data.date !== 'number') {
      data.date = Date.now();
    }

    CompositeState.addSummary(data);

    states.addSnapshot(data, data.date);

    if (!options.silent) {
      this.notifySummaryProcessed();
    }
  },

  processBulkState: function (data) {
    if (!Array.isArray(data)) {
      return MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
    }
    // Multiply Config.stateRefresh in order to use larger time slices
    data = MesosSummaryUtil.addTimestampsToData(data, Config.getRefreshRate());
    data.forEach(function (datum) {
      MesosSummaryStore.processSummary(datum, {silent: true});
    });
  },

  processSummaryError: function (options = {}) {
    let unsuccessfulSummary = new StateSummary({successful: false});
    let states = this.get('states');

    states.add(unsuccessfulSummary);

    if (!options.silent) {
      this.emit(MESOS_SUMMARY_REQUEST_ERROR);
    }
  },

  processOngoingRequest: function () {
    // Handle ongoing request here.
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case ActionTypes.REQUEST_SUMMARY_SUCCESS:
        MesosSummaryStore.processSummary(action.data);
        break;
      case ActionTypes.REQUEST_SUMMARY_HISTORY_SUCCESS:
        MesosSummaryStore.processBulkState(action.data);
        break;
      case ActionTypes.REQUEST_SUMMARY_ERROR:
        MesosSummaryStore.processSummaryError();
        break;
      case ActionTypes.REQUEST_SUMMARY_ONGOING:
      case ActionTypes.REQUEST_MESOS_HISTORY_ONGOING:
        MesosSummaryStore.processSummaryError();
        break;
    }

    return true;
  })

});

module.exports = MesosSummaryStore;
