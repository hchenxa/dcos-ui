import GroupsList from "./GroupsList";
import Item from "./Item";

export default class User extends Item {

  getGroups() {
    let groups = this.get("groups");
    let items = groups.map(function (groupMembership) {
      return groupMembership.group;
    });
    return new GroupsList({items});
  }

  getGroupCount() {
    return this.getGroups().getItems().length;
  }

  getPermissions() {
    return this.get("permissions");
  }

  getPermissionCount() {
    return this.uniquePermissions().length;
  }

  uniquePermissions() {
    let permissions = this.getPermissions();
    let uniquePermissions = [];
    let aclUrls = new Set();

    permissions.direct.forEach(function (service) {
      let url = service.aclurl;
      if (!aclUrls.has(url)) {
        uniquePermissions.push(service);
        aclUrls.add(url);
      }
    });

    permissions.groups.forEach(function (service) {
      let url = service.aclurl;
      if (!aclUrls.has(url)) {
        uniquePermissions.push(service);
        aclUrls.add(url);
      }
    });

    return uniquePermissions;
  }
}
