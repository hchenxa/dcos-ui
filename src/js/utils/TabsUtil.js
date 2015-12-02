import classNames from "classnames";
/*eslint-disable no-unused-vars*/
import React from "react/addons";
/*eslint-enable no-unused-vars*/

const TabsUtil = {

  /**
   * Renders tabs for a given array
   * This needs to be in a util because we can
   * have tabs inside of tabs for a component
   *
   * @param  {Object} tabs with a key for each tab to render
   * @param  {String} currentTab currently active tab
   * @param  {Function} getElement render function to render each element
   * @return {Array} of tabs to render
   */
  getTabs: function (tabs, currentTab, getElement) {
    let tabSet = Object.keys(tabs);

    return tabSet.map(function (tab, index) {
      let tabClass = classNames({
        "tab-item": true,
        "active": currentTab === tab
      });

      return (
        <li className={tabClass} key={tab}>
          {getElement(tab, index)}
        </li>
      );
    });
  }

};

export default TabsUtil;