var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

var AppDispatcher = require("../events/AppDispatcher");
var ActionTypes = require("../constants/ActionTypes");
var EventTypes = require("../constants/EventTypes");

var _metadata = {};

var MetadataStore = _.extend({}, EventEmitter.prototype, {

  getAll: function () {
    return _metadata;
  },

  emitChange: function (eventName) {
    this.emit(eventName);
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    var source = payload.source;
    if (source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    var action = payload.action;

    switch (action.type) {
      case ActionTypes.REQUEST_METADATA:
        var oldMetadata = _metadata;
        _metadata = action.data;

        // only emitting on change
        if (!_.isEqual(oldMetadata, _metadata)) {
          MetadataStore.emitChange(EventTypes.METADATA_CHANGE);
        }
        break;
    }

    return true;
  })

});

module.exports = MetadataStore;