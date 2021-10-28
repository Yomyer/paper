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
        //_applyMatrix: false,
        //_canApplyMatrix: false,
        _selectBounds: true,
        _selectChildren: false,
        _drawing: false,
        _getItemsInChildrens: true,
        _serializeFields: {
            size: null,
            poin: null,
            children: []
        },

        initialize: function Artboard() {
            var args = arguments;

            this._children = [];
            this._namedChildren = {};

            var rect = Rectangle.readNamed(args, "rectangle");
            if (rect) {
                args[0].size = rect.getSize(true);
                args[0].point = rect.getPoint(true);
            }            

            if (!this._initialize(args[0]))
                this.addChildren(Array.isArray(args) ? args : arguments);

            if (!this._size) {
                this.setSize(1000);
            }
            if (!this._point) {
                this.setPoint(0);
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

        /**
         * The size of the artboard.
         *
         * @bean
         * @type Size
         */

        getSize: function () {
            var size = this._size;
            return new LinkedSize(size.width, size.height, this, "setSize");
        },

        setSize: function (/* size */) {
            var size = Size.read(arguments);

            if (!this._size) {
                this._size = size.clone();
            } else if (!this._size.equals(size)) {
                this._size._set(size.width, size.height);
                this._changed(/*#=*/ Change.GEOMETRY);
            }
        },

        /**
         * The size of the artboard.
         *
         * @bean
         * @type Point
         */
        getPoint: function () {
            var point = this._point;
            return new LinkedPoint(point.x, point.y, this, "setPoint");
        },

        setPoint: function (/* point */) {
            var point = Point.read(arguments);

            if (!this._point) {
                this._point = point.clone();
            } else if (!this._point.equals(point)) {
                this._point._set(point.x, point.y);
                this._changed(/*#=*/ Change.GEOMETRY);
            }
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
            if (this._project._activeArtboard) {
                this._project._activeArtboard._actived = false;
            }

            this._project._activeArtboard = actived ? this : null;

            if (this.children.length) {
                this._selectBounds = actived;
                this._selectChildren = !actived;
            }

            setActived.base.call(this, actived);
        },

        isEmpty: function isEmpty(recursively) {
            /*if (recursively) {
                return false;
            }

            return !this._children.length;
            */
            return false;
        },

        copyContent: function copyContent(source) {
            this.setSize(source._size);
            this.setPoint(source._point);
            copyContent.base.call(this, source);
        },

        getStrokeBounds: function (matrix) {
            return this.getBounds(matrix, {
                drawing: this._drawing,
            });
        },

        _getBounds: function(matrix, options) {
            var rect = new Rectangle(this._size).setTopLeft(
                    this._point.x,
                    this._point.y
                ),
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
            if (!matrix) {
                return;
            }

            var rect = matrix._transformBounds(this.bounds);
            this._point.set(rect.x, rect.y);
            this._size.set(rect.width, rect.height);

            this._changed(/*#=*/ Change.MATRIX);

            this._transformContent(matrix, _applyRecursively, _setApplyMatrix);
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
                if (this.bounds.contains(viewMatrix._transformPoint(point))) {
                    var hit = new HitResult("fill", this);
                    var match = options.match;

                    if (match && !match(hit)) {
                        hit = null;
                    }

                    if(options.legacy){
                        hitTestChildren();
                    }

                    if (hit && options.all) {
                        options.all.push(hit);
                    }

                    return hit;
                }
                return hitTestChildren();
            } else {
                return hitTestChildren();
            }
        },

        _remove: function _remove(notifySelf, notifyParent) {
            if (this._project) {
                var index = this._project._artboards.indexOf(this);
                if (index != -1) {
                    this._project._artboards.splice(
                        index,
                        1
                    );
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
            this._drawRect(ctx, param, viewMatrix, strokeMatrix);
            this._drawChildren(ctx, param);
        },

        _drawRect: function (ctx, param, viewMatrix, strokeMatrix) {
            var style = this._style,
                hasFill = style.hasFill(),
                hasStroke = style.hasStroke(),
                dontPaint = param.dontFinish || param.clip,
                untransformed = !strokeMatrix;

            ctx.beginPath();
            if (hasFill || hasStroke || dontPaint) {
                var size = this._size,
                    point = this._point;

                ctx.rect(point.x, point.y, size.width, size.height);
                ctx.closePath();
            }

            if (!dontPaint && (hasFill || hasStroke)) {
                this._setStyles(ctx, param, viewMatrix);
                if (hasFill) {
                    ctx.fill(style.getFillRule());
                    ctx.shadowColor = "rgba(0,0,0,0)";
                }
                if (hasStroke) ctx.stroke();
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
