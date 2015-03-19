/** @jsx React.DOM */

var _ = require("underscore");
var Humanize = require("humanize");
var React = require("react/addons");

var Maths = require("../utils/Maths");
var Table = require("./Table");

function isStat(prop) {
  return _.contains(["cpus", "mem", "disk"], prop);
}

function renderHeadline(prop, model) {
  if (_.isEmpty(model.webui_url)) {
    return (
      <span className="h5 flush-top flush-bottom headline">
        <i className="icon icon-small icon-small-white border-radius"></i>
        {model[prop]}
      </span>
    );
  }

  return (
    <span className="h5 flush-top flush-bottom">
      <a href={model.webui_url} target="_blank" className="headline">
        <i className="icon icon-small icon-small-white border-radius"></i>
        {model[prop]}
      </a>
    </span>
  );
}

function renderHealth(prop, model) {
  var status = "Active";
  if (model.active !== true) {
    status = "Inactive";
  }

  var statusClassSet = React.addons.classSet({
    "collection-item-content-status": true,
    "text-success": model.active,
    "text-danger": !model.active
  });

  /* jshint trailing:false, quotmark:false, newcap:false */
  /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  return (
    <span className={statusClassSet}>{status}</span>
  );
  /* jshint trailing:true, quotmark:true, newcap:true */
  /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
}

function renderTask(prop, model) {
  return (
    <span>
      {model[prop]}
      <span className="visible-mini-inline"> Tasks</span>
    </span>
  );
}

function renderStats(prop, model) {
  var value = Maths.round(_.last(model.used_resources[prop]).value, 2);
  if(prop !== "cpus") {
    value = Humanize.filesize(value * 1024 * 1024, 1024, 1);
  }

  return (
    <span>
      {value}
    </span>
  );
}

function getClassName(prop, sortBy) {
  var classSet = React.addons.classSet({
    "align-right": isStat(prop) || prop === "tasks_size",
    "hidden-mini fixed-width": isStat(prop),
    "highlighted": prop === sortBy.prop
  });

  return classSet;
}

function sortFunction(prop) {
  if (isStat(prop)) {
    return function (model) {
      return _.last(model.used_resources[prop]).value;
    };
  }

  // rely on default sorting
  return null;
}

var columns = [
  {
    className: getClassName,
    headerClassName: getClassName,
    prop: "name",
    render: renderHeadline,
    sortable: true,
    title: "SERVICE NAME",
  },
  {
    className: getClassName,
    headerClassName: getClassName,
    prop: "active",
    render: renderHealth,
    sortable: true,
    title: "HEALTH",
  },
  {
    className: getClassName,
    headerClassName: getClassName,
    prop: "tasks_size",
    render: renderTask,
    sortable: true,
    title: "TASKS",
  },
  {
    className: getClassName,
    headerClassName: getClassName,
    prop: "cpus",
    render: renderStats,
    sortable: true,
    title: "CPU",
  },
  {
    className: getClassName,
    headerClassName: getClassName,
    prop: "mem",
    render: renderStats,
    sortable: true,
    title: "MEM",
  },
  {
    className: getClassName,
    headerClassName: getClassName,
    prop: "disk",
    render: renderStats,
    sortable: true,
    title: "DISK",
  },
];

var ServicesTable = React.createClass({

  displayName: "ServicesTable",

  propTypes: {
    frameworks: React.PropTypes.array.isRequired
  },

  getDefaultProps: function () {
    return {
      frameworks: []
    };
  },

  render: function () {

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <Table
        className="table"
        columns={columns}
        keys={["id"]}
        sortBy={{ prop: "name", order: "desc" }}
        sortFunc={sortFunction}
        dataArray={this.props.frameworks} />
    );
  }
});

module.exports = ServicesTable;