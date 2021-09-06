/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2020, Jürg Lehni & Jonathan Puckey
 * http://juerglehni.com/ & https://puckey.studio/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

QUnit.module('Project');

test('activate()', function() {
    var project = new Project();
    var secondDoc = new Project();
    project.activate();
    var path = new Path();
    equals(function() {
        return project.activeLayer.children[0] == path;
    }, true);
    equals(function() {
        return secondDoc.activeLayer.children.length == 0;
    }, true);
});

test('clear()', function() {
    var project = new Project();
    new Layer();
    new Layer();
    new Layer();
    equals(project.layers.length, 3);
    project.clear();
    equals(project.layers.length, 0);
});

test('getItemByPoint()', function(){
    var circle = new Path.Circle({
        center: [50, 50],
        radius: 100,
        fillColor: 'red'
    });

    var item = project.getItemByPoint([50, 50])

    equals(item, circle);
})

test('project#guides', function(){
    var guides = project.guidesLayer;

    equals(!!guides, true);
})
