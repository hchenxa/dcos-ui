import {Link} from 'react-router';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ComponentList from '../components/ComponentList';
import Config from '../config/Config';
import EventTypes from '../constants/EventTypes';
var HealthSorting = require('../constants/HealthSorting');
var HostTimeSeriesChart = require('../components/charts/HostTimeSeriesChart');
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var MarathonStore = require('../stores/MarathonStore');
var MesosSummaryStore = require('../stores/MesosSummaryStore');
var Page = require('../components/Page');
var Panel = require('../components/Panel');
var ResourceTimeSeriesChart = require('../components/charts/ResourceTimeSeriesChart');
var ServiceList = require('../components/ServiceList');
import StringUtil from '../utils/StringUtil';
var TasksChart = require('../components/charts/TasksChart');
var SidebarActions = require('../events/SidebarActions');
import SidePanels from '../components/SidePanels';
import UnitHealthStore from '../stores/UnitHealthStore';

function getMesosState() {
  let states = MesosSummaryStore.get('states');
  let last = states.lastSuccessful();

  return {
    hostsCount: states.getActiveNodesByState(),
    refreshRate: Config.getRefreshRate(),
    services: last.getServiceList(),
    usedResourcesStates: states.getResourceStatesForNodeIDs(),
    usedResources: last.getSlaveUsedResources(),
    totalResources: last.getSlaveTotalResources(),
    activeSlaves: last.getActiveSlaves(),
    statesProcessed: MesosSummaryStore.get('statesProcessed')
  };
}

function getKubernetesState() {
  let states = MesosSummaryStore.get('states');
  let last = states.lastSuccessful();

  return {
    hostsCount: states.getActiveNodesByState(),
    refreshRate: Config.getRefreshRate(),
    services: last.getServiceList(),
    usedResourcesStates: states.getResourceStatesForNodeIDs(),
    usedResources: last.getSlaveUsedResources(),
    totalResources: last.getSlaveTotalResources(),
    activeSlaves: last.getActiveSlaves(),
    statesProcessed: MesosSummaryStore.get('statesProcessed')
  };
}

var DashboardPage = React.createClass({

  displayName: 'DashboardPage',

  mixins: [InternalStorageMixin, StoreMixin],

  statics: {
    routeConfig: {
      label: 'Dashboard',
      icon: 'dashboard',
      matches: /^\/dashboard/
    },

    // Static life cycle method from react router, that will be called
    // 'when a handler is about to render', i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo: function () {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      componentsListLength: 5,
      servicesListLength: 5
    };
  },

  componentWillMount: function () {
    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['success', 'error']
      }
    ];

    this.internalStorage_set({
      openServicePanel: false,
      openTaskPanel: false
    });
    this.internalStorage_update(getMesosState());
  },

  componentDidMount: function () {
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );
    MarathonStore.addChangeListener(
      EventTypes.MARATHON_APPS_CHANGE,
      this.onMarathonStateChange
    );

    this.internalStorage_update({
      openServicePanel: this.props.params.serviceName != null,
      openTaskPanel: this.props.params.taskID != null
    });
  },

  componentWillReceiveProps: function (nextProps) {
    this.internalStorage_update({
      openServicePanel: nextProps.params.serviceName != null,
      openTaskPanel: nextProps.params.taskID != null
    });
  },

  componentWillUnmount: function () {
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );
    MarathonStore.removeChangeListener(
      EventTypes.MARATHON_APPS_CHANGE,
      this.onMarathonStateChange
    );
  },

  onMarathonStateChange: function () {
    this.forceUpdate();
  },

  onMesosStateChange: function () {
    this.internalStorage_update(getMesosState());
    this.forceUpdate();
  },

  onKubernetesStateChange: function () {
    this.internalStorage_update(getKubernetesState());
    this.forceUpdate();
  },

  getServicesList: function (services) {
    // Pick out only the data we need.
    let servicesMap = services.map(function (service) {
      return {
        name: service.get('name'),
        webui_url: service.get('webui_url'),
        TASK_RUNNING: service.get('TASK_RUNNING'),
        id: service.get('id')
      };
    });

    let sortedServices = servicesMap.sort(function (service, other) {
      let health = MarathonStore.getServiceHealth(service.name);
      let otherHealth = MarathonStore.getServiceHealth(other.name);

      return HealthSorting[health.key] - HealthSorting[otherHealth.key];
    });

    return sortedServices.slice(0, this.props.servicesListLength);
  },

  getK8SPodsList: function (pods) {
    // Pick out only the data we need.
    let servicesMap = pods.map(function (service) {
      return {
        name: service.get('name'),
        webui_url: service.get('webui_url'),
        TASK_RUNNING: service.get('TASK_RUNNING'),
        id: service.get('id')
      };
    });

    let sortedServices = servicesMap.sort(function (service, other) {
      let health = MarathonStore.getServiceHealth(service.name);
      let otherHealth = MarathonStore.getServiceHealth(other.name);

      return HealthSorting[health.key] - HealthSorting[otherHealth.key];
    });

    return sortedServices.slice(0, this.props.servicesListLength);
  },

  getK8SService: function (pods) {
    // Pick out only the data we need.
    let servicesMap = pods.map(function (service) {
      return {
        name: 'Kubernetes',
        webui_url: 'http://9.21.58.21:8888/api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/',
        TASK_RUNNING: service.get('TASK_RUNNING'),
        id: service.get('id')
      };
    });

    return servicesMap.slice(0, this.props.servicesListLength);
  },

  getUnits: function () {
    return UnitHealthStore.getUnits();
  },

  getViewAllComponentsButton: function () {
    var componentCount = this.getUnits().getItems().length;
    if (!componentCount) {
      return null;
    }

    var componentCountWord = StringUtil.pluralize('Component', componentCount);

    return (
      <Link to="system-overview-units"
        className="button button-wide button-inverse more-button">
        {`View all ${componentCount} ${componentCountWord}`}
      </Link>
    );
  },

  getViewAllServicesBtn: function () {
    var data = this.internalStorage_get();
    let servicesCount = data.services.getItems().length;
    if (!servicesCount) {
      return null;
    }

    var textContent = 'View all ';
    if (servicesCount > this.props.servicesListLength) {
      textContent += servicesCount + ' ';
    }
    textContent += 'Services';

    return (
      <Link to="services-page"
        className="button button-wide button-inverse more-button">
        {textContent}
      </Link>
    );
  },

  getViewAllK8SPodsBtn: function () {
    var data = this.internalStorage_get();
    let servicesCount = data.services.getItems().length;
    if (!servicesCount) {
      return null;
    }

    var textContent = 'View all ';
    if (servicesCount > this.props.servicesListLength) {
      textContent += servicesCount + ' ';
    }
    textContent += 'Kubernetes Pods';

    return (
      <Link to="services-page"
        className="button button-wide button-inverse more-button">
        {textContent}
      </Link>
    );
  },

  getViewAllK8SServicesBtn: function () {
    var data = this.internalStorage_get();
    let servicesCount = data.services.getItems().length;
    if (!servicesCount) {
      return null;
    }

    var textContent = 'View all ';
    if (servicesCount > this.props.servicesListLength) {
      textContent += servicesCount + ' ';
    }
    textContent += 'Kubernetes Services';

    return (
      <Link to="services-page"
        className="button button-wide button-inverse more-button">
        {textContent}
      </Link>
    );
  },

  getViewAllK8SRCsBtn: function () {
    var data = this.internalStorage_get();
    let servicesCount = data.services.getItems().length;
    if (!servicesCount) {
      return null;
    }

    var textContent = 'View all ';
    if (servicesCount > this.props.servicesListLength) {
      textContent += servicesCount + ' ';
    }
    textContent += 'Kubernetes RCs';

    return (
      <Link to="services-page"
        className="button button-wide button-inverse more-button">
        {textContent}
      </Link>
    );
  },

  getHeading: function (title) {
    return (
      <h5 className="flush inverse">
        {title}
      </h5>
    );
  },

  render: function () {
    let data = this.internalStorage_get();
    let appsProcessed = MarathonStore.hasProcessedApps();

    return (
      <Page title="Dashboard">
        <div className="grid row">
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-resource-chart"
              heading={this.getHeading('CPU Allocation')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ResourceTimeSeriesChart
                colorIndex={0}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="cpus"
                refreshRate={data.refreshRate} />
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-resource-chart"
              heading={this.getHeading('Memory Allocation')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ResourceTimeSeriesChart
                colorIndex={6}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="mem"
                refreshRate={data.refreshRate} />
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-resource-chart"
              heading={this.getHeading('Disk Allocation')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ResourceTimeSeriesChart
                colorIndex={3}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="disk"
                refreshRate={data.refreshRate} />
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-list dashboard-panel-list-service-health allow-overflow"
              heading={this.getHeading('Marathon Services Health')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ServiceList
                healthProcessed={appsProcessed}
                services={this.getServicesList(data.services.getItems())} />
              {this.getViewAllServicesBtn()}
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-list dashboard-panel-list-service-health allow-overflow"
              heading={this.getHeading('Kubernetes Health')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ServiceList
                healthProcessed={appsProcessed}
                services={this.getK8SService(data.services.getItems())} />
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-list dashboard-panel-list-service-health allow-overflow"
              heading={this.getHeading('Kubernetes Services Health')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ServiceList
                healthProcessed={appsProcessed}
                services={this.getServicesList(data.services.getItems())} />
              {this.getViewAllK8SServicesBtn()}
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-list dashboard-panel-list-service-health allow-overflow"
              heading={this.getHeading('Kubernetes Pod Health')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ServiceList
                healthProcessed={appsProcessed}
                services={this.getK8SPodsList(data.services.getItems())} />
              {this.getViewAllK8SPodsBtn()}
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-list dashboard-panel-list-service-health allow-overflow"
              heading={this.getHeading('Kubernetes Replication Controller Health')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ServiceList
                healthProcessed={appsProcessed}
                services={this.getServicesList(data.services.getItems())} />
              {this.getViewAllK8SRCsBtn()}
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel"
              heading={this.getHeading('Tasks')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <TasksChart tasks={data.services.sumTaskStates()} />
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-list dashboard-panel-list-component-health"
              heading={this.getHeading('Component Health')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <ComponentList
                displayCount={this.props.componentsListLength}
                units={this.getUnits()} />
              {this.getViewAllComponentsButton()}
            </Panel>
          </div>
          <div className="grid-item column-mini-6 column-large-4 column-x-large-3">
            <Panel
              className="panel panel-inverse dashboard-panel dashboard-panel-resource-chart"
              heading={this.getHeading('Nodes')}
              headingClass="panel-header panel-header-bottom-border inverse short-top short-bottom">
              <HostTimeSeriesChart
                data={data.hostsCount}
                currentValue={data.activeSlaves.length}
                refreshRate={data.refreshRate} />
            </Panel>
          </div>
        </div>
        <SidePanels
          params={this.props.params}
          openedPage="dashboard" />
      </Page>
    );
  }
});

module.exports = DashboardPage;
