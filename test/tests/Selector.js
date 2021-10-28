QUnit.module("Selector");

test("new Selector()", function () {
    var path = new Path.Circle([50, 50], 50);

    equals(path.selector.pathData, "M0,100v-100h100v100z");
});
