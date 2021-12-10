/**
 * @name Grid
 * @class
 */
var Grid = Base.extend(
    /** @lends Grid# */ {
        _class: "Grid",

        _color: null,
        _size: null,
        _opacity: null,
        _parent: null,
        _actived: false,

        /**
         * Creates a Grid object.
         *
         * @name Grid#initialize
         * @param {Object} object an object containing properties to be set on the
         * rectangle
         *
         * @example
         * var rectangle = new Grid({
         *     color: 'red',
         *     size: 60,
         *     opacity: 0.5
         * });
         *
         */
        /**
         * Creates a Grid object.
         *
         * @name Grid#initialize
         * @param {Color | string} [color]
         * @param {Size | number | Array<Number>} [size]
         * @param {number} [opacity]
         */
        initialize: function Grid(arg0, arg1, arg2, arg3) {
            var type = typeof arg0;
            if (type === "string" || arg0 instanceof Color) {
                this._set(arg0, arg1, arg2, arg3);
            } else if (type === "undefined" || arg0 === null) {
                this._set(paper.project);
            } else {
                this._set(arg0.color, arg0.size, arg0.opacity, arg0.actived);
            }
        },

        _set: function (color, size, opacity, actived) {
            this.color = color;
            this.size = size;
            this.opacity = opacity;
            this.actived = actived;
            return this;
        },

        _serialize: function (options) {
            return {
                color: this.color._serialize(),
                size: this.size._serialize(options),
                opacity: this.opacity,
                actived: this.actived
            };
        },

        /**
         * @bean
         * @type Color
         */
        getColor: function () {
            return this._color;
        },

        setColor: function (/* color */) {
            this._color = Color.read((arguments[0] && arguments) || ["black"]);
        },

        /**
         * @bean
         * @type Size
         */
        getSize: function () {
            return this._size;
        },

        setSize: function (/* size */) {
            this._size = Size.read((arguments[0] && arguments) || [1]);
        },

        /**
         * @bean
         * @type Number
         */
        getOpacity: function () {
            return this._opacity;
        },

        setOpacity: function (opacity) {
            this._opacity = opacity || 0.1;
        },

        /**
         * @bean
         * @type Artboard | Project
         */
        getParent: function () {
            return this._parent;
        },

        setParent: function (parent) {
            this._parent = parent;
            this._parent.grid = this;
        },

        /**
         * @bean
         * @type Artboard | Project
         */
        getActived: function () {
            return this._actived;
        },

        setActived: function (actived) {
            this._actived = actived;
        },

        /**
         * @bean
         * @type Project
         */
        getProject: function () {
            return this.isView() ? this._parent : this._parent._project;
        },

        /**
         * @bean
         * @type Project
         */
        getView: function () {
            return this.getProject()._view;
        },

        getBounds: function () {
            return this.isView()
                ? this.getView().bounds
                : this.getParent().bounds;
        },

        isView: function () {
            return this.getParent() instanceof Project;
        },

        _drawHorizontal: function (ctx) {
            var bounds = this.getBounds(),
                size = bounds.size,
                point = bounds.point,
                delta = this.getSize().width,
                offset = this.isView() ? delta : 0;

            for (
                var x = point.x - (point.x % offset || 0);
                x <= size.width + point.x;
                x = x + delta
            ) {
                ctx.moveTo(x, point.y - offset);
                ctx.lineTo(x, point.y + size.height + offset);
            }
        },

        _drawVertical: function (ctx) {
            var bounds = this.getBounds(),
                size = bounds.size,
                point = bounds.point;
                delta = this.getSize().height,
                offset = this.isView() ? delta : 0;

            for (
                var y = point.y - (point.y % offset || 0);
                y <= size.height + point.y;
                y = y + delta
            ) {
                ctx.moveTo(point.x - offset, y);
                ctx.lineTo(point.x + size.width + offset, y);
            }
        },

        draw: function (ctx, matrix, pixelRatio) {
            if(!this.actived){
                return;
            }
            
            var project = this.getProject(),
                view = this.getView(),
                zoom = view.getZoom();

            if (this.isView() && zoom < 5) {
                return;
            }

            ctx.strokeStyle = this._color.toCanvasStyle(ctx, matrix);
            ctx.globalAlpha = this._opacity;
            ctx.lineWidth = 0.5 * (1 / zoom);
            ctx.beginPath();
            this._drawHorizontal(ctx);
            this._drawVertical(ctx);
            ctx.stroke();
        },
    },
    new (function () {
        item = {
            beans: true,
            _grid: null,
            getGrid: function () {
                return this._grid;
            },
            setGrid: function (/* grid */) {
                this._grid = Grid.read(arguments);
                this._grid._parent = this;
            },
        };
        Item.inject(item);
        Project.inject(item);
    })()
);
