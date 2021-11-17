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

/**
 * @name Artboard
 *
 * @class The Layer item represents a layer in a Paper.js project.
 *
 * The layer which is currently active can be accessed through
 * {@link Project#activeArtboard}.
 * An array of all layers in a project can be accessed through
 * {@link Project#artboards}.
 *
 * @extends Group
 */
var Artboard = Group.extend(
    /** @lends Artboard# */ {
        _class: "Artboard",
        _applyChildrenStyle: false,
        _selectBounds: true,
        _selectChildren: false,
        _drawing: false,
        _getItemsInChildrens: true,
        _serializeStyle: true,
        _item: null,
        _serializeFields: {
            size: null,
            point: null,
            grid: null,
            children: [],
        },

        initialize: function Artboard() {
            var args = arguments;

            this._children = [];
            this._namedChildren = {};

            this.setItem(args[0]);

            if (!this._initialize(args[0])) {
                this.addChildren(Array.isArray(args) ? args : arguments);
            }

            this._project._artboards.push(this);
        },

        /**
         * Private helper to return the owner, either the parent, or the project
         * for top-level layers, if they are inserted in it.
         */
        _getOwner: function () {
            return this._parent || (this._index != null && this._project);
        },

        getItem: function () {
            return this._item;
        },

        setItem: function (args) {
            var args = Base.set(Object.assign({}, args), {
                insert: false,
                children: undefined,
                rotation: 0,
                actived: false,
            });

            this._item = new Shape.Rectangle(args);
        },

        /**
         * The name of the artboard.
         *
         * @bean
         * @type String
         */
        getName: function () {
            return this._name;
        },

        setName: function (name) {
            this._name = name;
        },

        /**
         * The name of the artboard.
         *
         * @bean
         * @type Boolean
         */
        getClipped: function () {
            return this._clipped;
        },

        setClipped: function (clipped) {
            this._clipped = clipped;
        },

        /**
         * The name of the artboard.
         *
         * @bean
         * @type Boolean
         */
        getActived: function () {
            return this._actived;
        },

        setActived: function setActived(actived) {
            this._project._activeArtboard = actived ? this : null;

            if (this.children.length) {
                this._selectBounds = actived;
                this._selectChildren = !actived;
            }

            setActived.base.call(this, actived);
        },

        isEmpty: function isEmpty(recursively) {
            return false;
        },

        copyContent: function copyContent(source) {
            copyContent.base.call(this, source);
        },

        getStrokeBounds: function (matrix) {
            return this.getBounds(matrix, {
                drawing: this._drawing,
            });
        },

        _getBounds: function (matrix, options) {
            var rect = this._item.bounds,
                style = this._style,
                strokeWidth =
                    options.stroke &&
                    style.hasStroke() &&
                    style.getStrokeWidth();

            if (options.drawing && !this._clipped) {
                var children = this._children;
                for (var i = 0, l = children.length; i < l; i++) {
                    rect = rect.unite(children[i].bounds);
                }
            }

            if (matrix) rect = matrix._transformBounds(rect);
            return strokeWidth
                ? rect.expand(
                      Path._getStrokePadding(
                          strokeWidth,
                          this._getStrokeMatrix(matrix, options)
                      )
                  )
                : rect;
        },

        transform: function tranform(
            matrix,
            _applyRecursively,
            _setApplyMatrix
        ) {
            if(!matrix){
                return;
            }

            this._item.transform(matrix, _applyRecursively, _setApplyMatrix);
            this._transformContent(matrix, _applyRecursively, _setApplyMatrix);

            this._changed(Change.MATRIX);
        },

        _hitTestChildren: function _hitTestChildren(
            point,
            options,
            viewMatrix
        ) {
            var that = this;
            function hitTestChildren() {
                return _hitTestChildren.base.call(
                    that,
                    point,
                    options,
                    viewMatrix
                );
            }

            if (options.legacy || this._actived || !this._children.length) {
                
                return hitTestChildren();
            } else {
                return hitTestChildren();
            }
        },

        _remove: function _remove(notifySelf, notifyParent) {
            this._item.remove();

            if (this._project) {
                var index = this._project._artboards.indexOf(this);
                if (index != -1) {
                    this._project._artboards.splice(index, 1);
                }
            }

            return _remove.base.call(this, notifySelf, notifyParent);
        },

        draw: function draw(ctx, param, parentStrokeMatrix) {
            this._drawing = true;
            draw.base.call(this, ctx, param.extend(), parentStrokeMatrix);
            this._false = true;
        },

        _draw: function (ctx, param, viewMatrix, strokeMatrix) {
            this._drawRect(ctx, param);
            this._drawChildren(ctx, param);
        },

        _drawRect: function (ctx, param) {
            if (this._item) {
                this._item.draw(ctx, param);
            }
        },

        _drawClip: function (ctx, param) {
            if (this.getClipped()) {
                var size = this._size,
                    point = this._point;

                var clipItem = new Shape.Rectangle(
                    point.x,
                    point.y,
                    size.width,
                    size.height
                );
                this._insertItem(0, clipItem);

                clipItem.draw(ctx, param.extend({ clip: true }));

                clipItem.remove();
            }
        },

        _drawChildren: function (ctx, param) {
            this._drawClip(ctx, param);

            var children = this._children;
            for (var i = 0, l = children.length; i < l; i++) {
                children[i].draw(ctx, param);
            }
        },
    }
);
