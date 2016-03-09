jest.dontMock('../ACLActions');

import {
  REQUEST_ACL_CREATE_SUCCESS,
  REQUEST_ACL_CREATE_ERROR,
  REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
  REQUEST_ACL_RESOURCE_ACLS_ERROR,
  REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
  REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
  REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
  REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_USER_GRANT_ACTION_ERROR,
  REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
  REQUEST_ACL_USER_REVOKE_ACTION_ERROR
} from '../../constants/ActionTypes';

import PluginTestUtils from 'PluginTestUtils';

let SDK = PluginTestUtils.getSDK('organization', {enabled: true});
require('../../../../SDK').setSDK(SDK);

let ACLActions = require('../ACLActions');

let {RequestUtil, Config} = SDK.get(['Config', 'RequestUtil']);

describe('ACLActions', function () {

  beforeEach(function () {
    this.configuration = null;
    this.requestUtilJSON = RequestUtil.json;
    RequestUtil.json = function (configuration) {
      this.configuration = configuration;
    }.bind(this);
    Config.rootUrl = '';
    Config.useFixtures = false;
  });

  afterEach(function () {
    RequestUtil.json = this.requestUtilJSON;
  });

  describe('#fetchACLs', function () {

    it('dispatches the correct action when successful', function () {
      ACLActions.fetchACLs('foo');
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action).toEqual({
          type: REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          __origin: 'organization',
          data: {bar: 'baz'},
          resourceType: 'foo'
        });
      });

      this.configuration.success({array: {bar: 'baz'}});
    });

    it('dispatches the correct action when unsuccessful', function () {
      ACLActions.fetchACLs('bar');
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action).toEqual({
          type: REQUEST_ACL_RESOURCE_ACLS_ERROR,
          __origin: 'organization',
          data: 'bar',
          resourceType: 'bar'
        });
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.fetchACLs('foo');
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.fetchACLs('bar');
      expect(RequestUtil.json.mostRecentCall.args[0].url)
        .toEqual(Config.acsAPIPrefix + '/acls?type=bar');
    });

    it('fetches data from the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.fetchACLs();
      expect(RequestUtil.json.mostRecentCall.args[0].url)
        .toEqual(Config.acsAPIPrefix + '/acls');
    });
  });

  describe('#createACLForResource', function () {

    beforeEach(function () {
      ACLActions.createACLForResource('some.resource', {});
    });

    it('dispatches the correct action when successful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_CREATE_SUCCESS,
            resourceID: 'some.resource'
          });
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_CREATE_ERROR,
            resourceID: 'some.resource',
            data: 'bar'
          });
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('sends data to the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.createACLForResource('some.resource', {});
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.url)
        .toEqual(Config.acsAPIPrefix + '/acls/some.resource');
    });

    it('sends a PUT request', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.createACLForResource('some.resource', {});
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.method).toEqual('PUT');
    });

  });

  describe('#grantUserActionToResource', function () {

    beforeEach(function () {
      ACLActions.grantUserActionToResource('foo', 'access', 'bar');
    });

    it('dispatches the correct action when successful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
            triple: {userID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_USER_GRANT_ACTION_ERROR,
            data: 'bar',
            triple: {userID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('sends data to the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.grantUserActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.url)
        .toEqual(Config.acsAPIPrefix + '/acls/bar/users/foo/access');
    });

    it('sends a PUT request', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.grantUserActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.method).toEqual('PUT');
    });

  });

  describe('#revokeUserActionToResource', function () {

    beforeEach(function () {
      ACLActions.revokeUserActionToResource('foo', 'access', 'bar');
    });

    it('dispatches the correct action when successful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
            triple: {userID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
            data: 'bar',
            triple: {userID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('sends data to the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.revokeUserActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.url)
        .toEqual(Config.acsAPIPrefix + '/acls/bar/users/foo/access');
    });

    it('sends a DELETE request', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.revokeUserActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.method).toEqual('DELETE');
    });

  });

  describe('#grantGroupActionToResource', function () {

    beforeEach(function () {
      ACLActions.grantGroupActionToResource('foo', 'access', 'bar');
    });

    it('dispatches the correct action when successful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
            triple: {groupID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
            data: 'bar',
            triple: {groupID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('sends data to the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.grantGroupActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.url)
        .toEqual(Config.acsAPIPrefix + '/acls/bar/groups/foo/access');
    });

    it('sends a PUT request', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.grantGroupActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.method).toEqual('PUT');
    });

  });

  describe('#revokeGroupActionToResource', function () {

    beforeEach(function () {
      ACLActions.revokeGroupActionToResource('foo', 'access', 'bar');
    });

    it('dispatches the correct action when successful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
            triple: {groupID: 'foo', action: 'access', resourceID: 'bar'}
          });
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var unsubscribe = SDK.onDispatch(function (action) {
        unsubscribe();
        expect(action)
          .toEqual({
            __origin: 'organization',
            type: REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
            data: 'bar',
            triple: {groupID: 'foo', resourceID: 'bar', action: 'access'}
          });
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('sends data to the correct URL', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.revokeGroupActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.url)
        .toEqual(Config.acsAPIPrefix + '/acls/bar/groups/foo/access');
    });

    it('sends a DELETE request', function () {
      spyOn(RequestUtil, 'json');
      ACLActions.revokeUserActionToResource('foo', 'access', 'bar');
      var requestArgs = RequestUtil.json.mostRecentCall.args[0];
      expect(requestArgs.method).toEqual('DELETE');
    });

  });

});