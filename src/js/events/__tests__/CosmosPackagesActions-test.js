jest.dontMock('../CosmosPackagesActions');
jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

import {
  REQUEST_COSMOS_PACKAGES_LIST_ERROR,
  REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
  REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
  REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
  REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS
} from '../../constants/ActionTypes';
var AppDispatcher = require('../AppDispatcher');
var CosmosPackagesActions = require('../CosmosPackagesActions');
var Config = require('../../config/Config');
var RequestUtil = require('../../utils/RequestUtil');

describe('CosmosPackagesActions', function () {

  describe('#fetchAvailablePackages', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      CosmosPackagesActions.fetchAvailablePackages('foo');
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS);
      });

      this.configuration.success({packages: [{bar: 'baz'}]});
    });

    it('dispatches with the correct data when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([{bar: 'baz'}]);
      });

      this.configuration.success({packages: [{bar: 'baz'}]});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGES_SEARCH_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches with the correct data when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.cosmosAPIPrefix + '/search');
    });

    it('sends query in request body', function () {
      expect(JSON.parse(this.configuration.data)).toEqual({query: 'foo'});
    });

    it('sends query in request body, even if it is undefined', function () {
      CosmosPackagesActions.fetchAvailablePackages();
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
      expect(JSON.parse(this.configuration.data))
        .toEqual({query: undefined});
    });

    it('sends a POST request', function () {
      expect(this.configuration.method).toEqual('POST');
    });

  });

  describe('#fetchInstalledPackages', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      CosmosPackagesActions.fetchInstalledPackages('foo', 'bar');
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGES_LIST_SUCCESS);
      });

      this.configuration.success({packages: [{bar: 'baz'}]});
    });

    it('dispatches with the correct data when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([{bar: 'baz'}]);
      });

      this.configuration.success({packages: [{bar: 'baz'}]});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGES_LIST_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches with the correct data when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.cosmosAPIPrefix + '/list');
    });

    it('sends query in request body', function () {
      expect(JSON.parse(this.configuration.data))
        .toEqual({packageName: 'foo', appId: 'bar'});
    });

    it('sends query in request body, even if it is undefined', function () {
      CosmosPackagesActions.fetchInstalledPackages();
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
      expect(JSON.parse(this.configuration.data))
        .toEqual({packageName: undefined, appId: undefined});
    });

    it('sends a POST request', function () {
      expect(this.configuration.method).toEqual('POST');
    });

  });

  describe('#fetchPackageDescription', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      CosmosPackagesActions.fetchPackageDescription('foo', 'bar');
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS);
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches with the correct data when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({bar: 'baz'});
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches with the correct data when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.cosmosAPIPrefix + '/describe');
    });

    it('sends query in request body', function () {
      expect(JSON.parse(this.configuration.data))
        .toEqual({packageName: 'foo', packageVersion: 'bar'});
    });

    it('sends query in request body, even if it is undefined', function () {
      CosmosPackagesActions.fetchPackageDescription();
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
      expect(JSON.parse(this.configuration.data))
        .toEqual({
          packageName: undefined,
          packageVersion: undefined
        });
    });

    it('sends a POST request', function () {
      expect(this.configuration.method).toEqual('POST');
    });

  });

  describe('#installPackage', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      CosmosPackagesActions.installPackage('foo', 'bar', {baz: 'qux'});
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS);
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches with the correct data when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({bar: 'baz'});
        expect(action.packageName).toEqual('foo');
        expect(action.packageVersion).toEqual('bar');
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGE_INSTALL_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches with the correct data when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
        expect(action.packageName).toEqual('foo');
        expect(action.packageVersion).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.cosmosAPIPrefix + '/install');
    });

    it('sends query in request body', function () {
      expect(JSON.parse(this.configuration.data))
        .toEqual({
          packageName: 'foo',
          packageVersion: 'bar',
          options: {baz: 'qux'}
        });
    });

    it('sends query in request body, even if it is undefined', function () {
      CosmosPackagesActions.installPackage();
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
      expect(JSON.parse(this.configuration.data))
        .toEqual({
          packageName: undefined,
          packageVersion: undefined,
          options: undefined
        });
    });

    it('sends a POST request', function () {
      expect(this.configuration.method).toEqual('POST');
    });

  });

  describe('#uninstallPackage', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      CosmosPackagesActions.uninstallPackage('foo', 'bar', true);
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS);
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches with the correct data when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({bar: 'baz'});
        expect(action.packageName).toEqual('foo');
        expect(action.packageVersion).toEqual('bar');
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches with the correct data when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.cosmosAPIPrefix + '/uninstall');
    });

    it('sends query in request body', function () {
      expect(JSON.parse(this.configuration.data))
        .toEqual({
          packageName: 'foo',
          packageVersion: 'bar',
          all: true
        });
    });

    it('sends query in request body, even if it is undefined', function () {
      CosmosPackagesActions.uninstallPackage();
      this.configuration = RequestUtil.json.mostRecentCall.args[0];
      expect(JSON.parse(this.configuration.data))
        .toEqual({
          packageName: undefined,
          packageVersion: undefined,
          all: false
        });
    });

    it('sends a POST request', function () {
      expect(this.configuration.method).toEqual('POST');
    });

  });

});
