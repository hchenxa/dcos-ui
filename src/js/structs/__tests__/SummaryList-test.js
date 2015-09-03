jest.dontMock("../List");
jest.dontMock("../SummaryList");
jest.dontMock("../StateSummary");

let SummaryList = require("../SummaryList");
let StateSummary = require("../StateSummary");

describe("SummaryList", function () {

  describe("#add", function () {

    it("shifts elements off the list when max length is set", function () {
      let list = new SummaryList({items: [0], maxLength: 2});
      list.add(1);
      list.add(2);
      expect(list.getItems()).toEqual([1, 2]);
    });

  });

  describe("#addSnapshot", function () {

    it("adds new item to list", function () {
      let list = new SummaryList();
      expect(list.getItems().length).toEqual(0);
      list.addSnapshot({}, Date.now());
      expect(list.getItems().length).toEqual(1);
    });

    it("creates an instance of StateSummary out of an object", function () {
      let list = new SummaryList();
      list.addSnapshot({}, Date.now());
      let instance = list.last();
      expect(instance instanceof StateSummary).toEqual(true);
    });

  });

});